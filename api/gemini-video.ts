import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { applyCors, requireUser } from './_lib/auth.js';
import { prepareTaskRegistry, registerProviderTask } from './_lib/providerTasks.js';
import { isReferenceUrl } from './_lib/providerMedia.js';

interface GeminiVideoRequest {
  prompt?: string;
  imageUrls?: string[];
  referenceImages?: { data: string; mimeType?: string }[];
  duration?: number;
  quality?: string;
  aspectRatio?: string;
}

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

  const { prompt = '', imageUrls = [], referenceImages = [], duration = 5, aspectRatio = '16:9' } = body || {};

  if (body?.imageUrls != null && (!Array.isArray(body.imageUrls) || body.imageUrls.some((url: unknown) => !isReferenceUrl(url)))) {
    return res.status(400).json({ error: 'Invalid reference media.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare image if provided
    let imageParam: any = undefined;
    if (referenceImages.length > 0 && referenceImages[0].data) {
      const dataUri = referenceImages[0].data;
      const base64Data = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
      const mimeType = referenceImages[0].mimeType || 'image/jpeg';
      imageParam = {
        imageBytes: base64Data,
        mimeType,
      };
    } else if (imageUrls.length > 0) {
      imageParam = {
        uri: imageUrls[0],
      };
    }

    const genParams: any = {
      model: 'gemini-omni-1.1-flash',
      prompt: prompt.trim() || undefined,
      config: {
        aspectRatio,
        durationSeconds: Number(duration) || 5,
      },
    };

    if (imageParam) {
      genParams.image = imageParam;
    }

    const operation = await ai.models.generateVideos(genParams);
    const taskId = operation.name;

    if (!taskId) {
      return res.status(502).json({ error: 'Gemini did not return an operation name.' });
    }

    await registerProviderTask(writer, 'gemini', taskId, user.id);
    return res.status(200).json({ taskId });
  } catch (error: any) {
    return res.status(error?.status || 500).json({ error: error?.message || 'Gemini video generation failed to start.' });
  }
}
