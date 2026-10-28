import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import { applyCors, requireUser } from './_lib/auth.js';
import { requireProviderTask } from './_lib/providerTasks.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireUser(req, res);
  if (!user) return;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });

  const taskId = req.query.taskId as string;
  if (!taskId) return res.status(400).json({ error: 'taskId is required' });
  if (!await requireProviderTask(req, res, 'gemini', taskId)) return;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const reqOperation = new GenerateVideosOperation();
    reqOperation.name = taskId;
    const operation = await ai.operations.getVideosOperation({ operation: reqOperation });

    if (!operation.done) {
      return res.status(200).json({
        status: 'processing',
        progress: 0.5,
      });
    }

    if (operation.error) {
      return res.status(200).json({
        status: 'failed',
        error: operation.error.message || 'Gemini video generation failed',
      });
    }

    const generatedVideos = operation.response?.generatedVideos || [];
    const videoUrls: string[] = [];

    for (const item of generatedVideos) {
      if (item.video?.uri) {
        videoUrls.push(item.video.uri);
      } else if (item.video?.videoBytes) {
        videoUrls.push(`data:video/mp4;base64,${item.video.videoBytes}`);
      }
    }

    return res.status(200).json({
      status: 'completed',
      progress: 1.0,
      output: videoUrls,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to poll Gemini video operation.' });
  }
}
