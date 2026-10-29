import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, type GenerateVideosParameters, type Image } from '@google/genai';
import { applyCors, requireUser } from './_lib/auth.js';
import { prepareTaskRegistry, registerProviderTask, requireProviderTask } from './_lib/providerTasks.js';
import { isReferenceUrl, providerImageData } from './_lib/providerMedia.js';

interface GeminiVideoRequest {
  generationId?: string;
  prompt?: string;
  imageUrls?: string[];
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
    if (!Array.isArray(body.imageUrls)) {
      return res.status(400).json({ error: 'imageUrls must be an array' });
    }
    if (body.imageUrls.some((url: unknown) => !isReferenceUrl(url))) {
      return res.status(400).json({ error: 'Invalid reference media.' });
    }
  }

  if (body.referenceImages !== undefined) {
    if (!Array.isArray(body.referenceImages)) {
      return res.status(400).json({ error: 'referenceImages must be an array' });
    }
    if (body.referenceImages.length > 0) {
      const first = body.referenceImages[0];
      if (!first || typeof first !== 'object' || Array.isArray(first) || (first.data !== undefined && typeof first.data !== 'string')) {
        return res.status(400).json({ error: 'Invalid reference image data' });
      }
    }
  }

  if (body.generationId !== undefined && (typeof body.generationId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,199}$/.test(body.generationId))) {
    return res.status(400).json({ error: 'A valid generation ID is required' });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt : '';
  const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls : [];
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

  // Idempotency and gallery claim check
  let galleryClaim: { id: string; metadata: Record<string, unknown> } | undefined;
  if (body.generationId) {
    const { data: saved, error: readError } = await writer.from('generations')
      .select('id,user_id,type,status,task_id,metadata').eq('id', body.generationId).eq('user_id', user.id).maybeSingle();
    if (readError) return res.status(503).json({ error: 'Saved generation access could not be verified. No provider request was sent.' });
    if (!saved || saved.user_id !== user.id || saved.type !== 'video') return res.status(404).json({ error: 'Saved video generation not found' });
    const metadata = saved.metadata && typeof saved.metadata === 'object' && !Array.isArray(saved.metadata) ? saved.metadata : {};
    if (saved.task_id) {
      if (!await requireProviderTask(req, res, 'gemini', saved.task_id)) return;
      return res.status(200).json({ taskId: saved.task_id });
    }
    if (saved.status !== 'pending' || metadata.geminiSubmissionStartedAt) {
      return res.status(409).json({ code: 'GENERATION_SUBMITTING', error: 'This saved video is already being submitted. Check the existing task instead of submitting again.' });
    }
    const claimedMetadata = { ...metadata, geminiSubmissionStartedAt: Date.now() };
    const { data: claimed, error: claimError } = await writer.from('generations')
      .update({ status: 'processing', metadata: claimedMetadata }).eq('id', body.generationId).eq('user_id', user.id).eq('status', 'pending').select('id').maybeSingle();
    if (claimError) return res.status(503).json({ error: 'The saved video could not be claimed. No provider request was sent.' });
    if (!claimed) return res.status(409).json({ code: 'GENERATION_SUBMITTING', error: 'This saved video is already being submitted. Check the existing task instead of submitting again.' });
    galleryClaim = { id: body.generationId, metadata: claimedMetadata };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare image if provided
    let imageParam: Image | undefined = undefined;
    if (referenceImages.length > 0 && referenceImages[0].data) {
      const dataUri = await providerImageData(writer, referenceImages[0].data);
      const base64Data = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
      const mimeType = referenceImages[0].mimeType || (dataUri.startsWith('data:') ? dataUri.slice(5, dataUri.indexOf(';')) : 'image/jpeg');
      imageParam = {
        imageBytes: base64Data,
        mimeType,
      };
    }

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
    const taskId = operation.name;

    if (!taskId) {
      if (galleryClaim) {
        const { error: updateErr } = await writer.from('generations').update({ status: 'failed', metadata: { ...galleryClaim.metadata, error: 'Gemini did not return an operation name.' } }).eq('id', galleryClaim.id);
        if (updateErr) console.error('Failed to update generation status to failed:', { generationId: galleryClaim.id, error: updateErr.message });
      }
      return res.status(502).json({ error: 'Gemini did not return an operation name.' });
    }

    try {
      await registerProviderTask(writer, 'gemini', taskId, user.id);
    } catch (regError: any) {
      if (galleryClaim) {
        const { error: updateErr } = await writer.from('generations').update({ status: 'failed', task_id: taskId, metadata: { ...galleryClaim.metadata, error: regError.message } }).eq('id', galleryClaim.id);
        if (updateErr) console.error('Failed to update generation status to failed with taskId:', { generationId: galleryClaim.id, taskId, error: updateErr.message });
      }
      return res.status(503).json({ error: regError.message, taskId });
    }

    if (galleryClaim) {
      const { error: updateErr } = await writer.from('generations').update({ task_id: taskId }).eq('id', galleryClaim.id);
      if (updateErr) console.error('Failed to update generation taskId:', { generationId: galleryClaim.id, taskId, error: updateErr.message });
    }

    return res.status(200).json({ taskId });
  } catch (error: any) {
    if (galleryClaim) {
      const { error: updateErr } = await writer.from('generations').update({ status: 'failed', metadata: { ...galleryClaim.metadata, error: error?.message || 'Gemini video generation failed to start.' } }).eq('id', galleryClaim.id);
      if (updateErr) console.error('Failed to update generation status to failed:', { generationId: galleryClaim.id, error: updateErr.message });
    }
    return res.status(error?.status || 500).json({ error: error?.message || 'Gemini video generation failed to start.' });
  }
}
