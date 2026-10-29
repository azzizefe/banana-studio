import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, type GenerateVideosParameters, type Image } from '@google/genai';
import { applyCors, requireUser, createUserScopedClient } from './_lib/auth.js';
import { prepareTaskRegistry, registerProviderTask, requireProviderTask } from './_lib/providerTasks.js';
import { providerImageData } from './_lib/providerMedia.js';

interface GeminiVideoRequest {
  generationId: string;
  prompt?: string;
  imageUrls?: unknown;
  referenceImages?: { data: string; mimeType?: string }[];
  duration?: number;
  quality?: string;
  aspectRatio?: string;
}

const ALLOWED_ASPECT_RATIOS = new Set(['16:9', '9:16', '1:1', '4:3', '3:4']);
const ALLOWED_DURATIONS = new Set([5, 10]);
const ALLOWED_QUALITIES = new Set(['720p', '1080p']);

export const config = {
  maxDuration: 120,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireUser(req, res);
  if (!user) return;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  const writer = await prepareTaskRegistry(res);
  if (!writer) return;

  let body: GeminiVideoRequest;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  if (body.prompt !== undefined && typeof body.prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt must be a string' });
  }

  if (body.imageUrls !== undefined) {
    return res.status(400).json({ error: 'imageUrls is not supported for Gemini video. Send reference images in referenceImages instead.' });
  }

  if (body.referenceImages !== undefined) {
    if (!Array.isArray(body.referenceImages)) {
      return res.status(400).json({ error: 'referenceImages must be an array' });
    }
    for (const img of body.referenceImages) {
      if (!img || typeof img !== 'object' || Array.isArray(img) || typeof img.data !== 'string' || !img.data.trim()) {
        return res.status(400).json({ error: 'Invalid reference image data: each item must be an object with a non-empty data string' });
      }
    }
  }

  if (!body.generationId || typeof body.generationId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/.test(body.generationId)) {
    return res.status(400).json({ error: 'A valid generation ID is required' });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt : '';
  const referenceImages = Array.isArray(body.referenceImages) ? body.referenceImages : [];
  const duration = body.duration ?? 5;
  const quality = body.quality ?? '720p';
  const aspectRatio = body.aspectRatio ?? '16:9';

  // Server allowlist validation
  if (!ALLOWED_ASPECT_RATIOS.has(aspectRatio)) {
    return res.status(400).json({ error: `Invalid aspect ratio: ${aspectRatio}. Supported: 16:9, 9:16, 1:1, 4:3, 3:4` });
  }
  const durationNum = Number(duration);
  if (!ALLOWED_DURATIONS.has(durationNum)) {
    return res.status(400).json({ error: `Invalid duration: ${duration}. Supported durations are 5s and 10s.` });
  }
  if (!ALLOWED_QUALITIES.has(quality)) {
    return res.status(400).json({ error: `Invalid quality: ${quality}. Supported qualities are 720p and 1080p.` });
  }

  // Validate and prepare reference image BEFORE claim (normalizes raw base64 and enforces user storage path ownership)
  let imageParam: Image | undefined = undefined;
  if (referenceImages.length > 0 && referenceImages[0]?.data) {
    let rawData = referenceImages[0].data.trim();
    const mimeType = referenceImages[0].mimeType || 'image/jpeg';

    // Normalize raw base64 to data URI
    if (!rawData.startsWith('http://') && !rawData.startsWith('https://') && !rawData.startsWith('data:')) {
      rawData = `data:${mimeType};base64,${rawData}`;
    }

    // Verify storage path ownership if reference is a storage URL
    if (rawData.startsWith('http://') || rawData.startsWith('https://')) {
      try {
        const parsedUrl = new URL(rawData);
        const match = parsedUrl.pathname.match(/^\/storage\/v1\/object\/(?:authenticated|sign|public)\/media\/(.+)$/);
        if (match) {
          const storagePath = decodeURIComponent(match[1]);
          if (!storagePath.startsWith(`${user.id}/`)) {
            return res.status(403).json({ error: 'Unauthorized reference image: storage path does not belong to user.' });
          }
        }
      } catch {
        return res.status(400).json({ error: 'Invalid reference image URL' });
      }
    }

    const userDb = createUserScopedClient(req);
    let dataUri: string;
    try {
      dataUri = await providerImageData(userDb, rawData);
    } catch (imgErr: any) {
      return res.status(400).json({ error: imgErr.message || 'Invalid reference image.' });
    }

    const base64Data = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
    const detectedMime = referenceImages[0].mimeType || (dataUri.startsWith('data:') ? dataUri.slice(5, dataUri.indexOf(';')) : 'image/jpeg');
    imageParam = {
      imageBytes: base64Data,
      mimeType: detectedMime,
    };
  }

  // Idempotency and gallery claim check
  const generationId = body.generationId;
  const { data: saved, error: readError } = await writer.from('generations')
    .select('id,user_id,type,status,task_id,metadata').eq('id', generationId).eq('user_id', user.id).maybeSingle();
  if (readError) return res.status(503).json({ error: 'Saved generation access could not be verified. No provider request was sent.' });
  if (!saved || saved.user_id !== user.id || saved.type !== 'video') return res.status(404).json({ error: 'Saved video generation not found' });
  const metadata = saved.metadata && typeof saved.metadata === 'object' && !Array.isArray(saved.metadata) ? saved.metadata : {};
  if (saved.task_id) {
    const userDb = createUserScopedClient(req);
    const { data: existingTask } = await userDb.from('provider_tasks')
      .select('task_id').eq('provider', 'gemini').eq('task_id', saved.task_id).maybeSingle();
    if (!existingTask) {
      try {
        await registerProviderTask(writer, 'gemini', saved.task_id, user.id);
      } catch {
        return res.status(503).json({ error: 'Task registration could not be recovered. Contact an administrator before retrying.' });
      }
    }
    return res.status(200).json({ taskId: saved.task_id });
  }
  if (saved.status !== 'pending' || metadata.geminiSubmissionStartedAt) {
    return res.status(409).json({ code: 'GENERATION_SUBMITTING', error: 'This saved video is already being submitted. Check the existing task instead of submitting again.' });
  }
  const claimedMetadata = { ...metadata, geminiSubmissionStartedAt: Date.now() };
  const { data: claimed, error: claimError } = await writer.from('generations')
    .update({ status: 'processing', metadata: claimedMetadata }).eq('id', generationId).eq('user_id', user.id).eq('status', 'pending').select('id').maybeSingle();
  if (claimError) return res.status(503).json({ error: 'The saved video could not be claimed. No provider request was sent.' });
  if (!claimed) return res.status(409).json({ code: 'GENERATION_SUBMITTING', error: 'This saved video is already being submitted. Check the existing task instead of submitting again.' });
  const galleryClaim = { id: generationId, metadata: claimedMetadata };

  try {
    const ai = new GoogleGenAI({ apiKey });

    const trimmedPrompt = prompt.trim();
    const source: GenerateVideosParameters['source'] = {
      ...(trimmedPrompt ? { prompt: trimmedPrompt } : {}),
      ...(imageParam ? { image: imageParam } : {}),
    };

    const genParams: GenerateVideosParameters = {
      model: 'gemini-omni-1.1-flash',
      source,
      config: {
        aspectRatio,
        durationSeconds: durationNum,
        resolution: quality,
      },
    };

    const operation = await ai.models.generateVideos(genParams);
    const taskId = operation?.name;

    if (!taskId) {
      // Operation did not start; release the claim so retry does not get 409
      const resetMetadata = { ...galleryClaim.metadata };
      delete resetMetadata.geminiSubmissionStartedAt;
      await writer.from('generations')
        .update({ status: 'pending', metadata: resetMetadata })
        .eq('id', galleryClaim.id);
      return res.status(502).json({ error: 'Gemini did not return an operation name.' });
    }

    let registered = false;
    let lastRegError: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await registerProviderTask(writer, 'gemini', taskId, user.id);
        registered = true;
        break;
      } catch (err: any) {
        lastRegError = err;
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
        }
      }
    }

    if (!registered) {
      // Record taskId in generation for future recovery/admin, but do not hand out unusable taskId in 503 response
      const { error: updateErr } = await writer.from('generations')
        .update({ task_id: taskId, status: 'processing', metadata: { ...galleryClaim.metadata, error: lastRegError?.message } })
        .eq('id', galleryClaim.id);
      if (updateErr) console.error('Failed to update generation with taskId on regError:', { generationId: galleryClaim.id, taskId, error: updateErr.message });
      return res.status(503).json({ error: lastRegError?.message || 'Task registration failed.' });
    }

    const { error: updateErr } = await writer.from('generations').update({ task_id: taskId }).eq('id', galleryClaim.id);
    if (updateErr) console.error('Failed to update generation taskId:', { generationId: galleryClaim.id, taskId, error: updateErr.message });

    return res.status(200).json({ taskId });
  } catch (error: any) {
    const errorStatus = Number(error?.status || error?.statusCode || 500);
    const isDefinitiveRejection = errorStatus >= 400 && errorStatus < 500;
    if (isDefinitiveRejection) {
      const { error: updateErr } = await writer.from('generations').update({
        status: 'failed',
        metadata: { ...galleryClaim.metadata, error: error?.message || 'Gemini video generation was rejected.' }
      }).eq('id', galleryClaim.id);
      if (updateErr) console.error('Failed to update generation status to failed:', { generationId: galleryClaim.id, error: updateErr.message });
    } else {
      // 5xx or network error before an operation was established: release claim so user can retry
      const resetMetadata = { ...galleryClaim.metadata };
      delete resetMetadata.geminiSubmissionStartedAt;
      const { error: resetErr } = await writer.from('generations').update({
        status: 'pending',
        metadata: resetMetadata
      }).eq('id', galleryClaim.id);
      if (resetErr) console.error('Failed to release generation claim on 5xx/network error:', { generationId: galleryClaim.id, error: resetErr.message });
    }
    return res.status(errorStatus).json({ error: error?.message || 'Gemini video generation failed to start.' });
  }
}
