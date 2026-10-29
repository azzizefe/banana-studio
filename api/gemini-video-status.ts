import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import { applyCors, requireUser, createUserScopedClient } from './_lib/auth.js';
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
    if (generatedVideos.length === 0) {
      return res.status(200).json({
        status: 'failed',
        error: 'Gemini video generation completed without output videos.',
      });
    }
    const videoUrls: string[] = [];

    const db = createUserScopedClient(req);
    const bucket = db.storage.from('media');
    const safeTaskId = taskId.replace(/[^a-zA-Z0-9_-]/g, '_');

    for (let i = 0; i < generatedVideos.length; i++) {
      const item = generatedVideos[i];
      const storagePath = `${user.id}/gemini-video/${safeTaskId}${generatedVideos.length > 1 ? `_${i}` : ''}.mp4`;

      // Check if already stored
      const existing = await bucket.createSignedUrl(storagePath, 86400);
      if (!existing.error && existing.data?.signedUrl) {
        videoUrls.push(existing.data.signedUrl);
        continue;
      }

      let buffer: Buffer | null = null;
      if (item.video?.videoBytes) {
        buffer = Buffer.from(item.video.videoBytes, 'base64');
      } else if (item.video?.uri) {
        let fetchUrl: URL;
        try {
          fetchUrl = new URL(item.video.uri);
        } catch {
          return res.status(200).json({
            status: 'failed',
            error: 'Invalid video download URL received from Gemini.',
          });
        }

        if (fetchUrl.protocol !== 'https:' || fetchUrl.hostname !== 'generativelanguage.googleapis.com') {
          return res.status(200).json({
            status: 'failed',
            error: 'Unauthorized video download URL received from Gemini.',
          });
        }

        let dlRes: Response;
        try {
          dlRes = await fetch(fetchUrl.toString(), {
            headers: { 'x-goog-api-key': apiKey },
            redirect: 'error',
            signal: AbortSignal.timeout(60_000),
          });
        } catch (netErr: any) {
          console.error('Gemini video download network error:', { taskId, index: i, error: netErr?.message || netErr });
          return res.status(503).json({
            error: 'Gemini video download failed temporarily. Try again shortly.',
            retryable: true,
          });
        }

        if (!dlRes.ok) {
          // 408 (timeout) and 429 (rate limit) are temporary; other 4xx are permanent.
          if (dlRes.status >= 400 && dlRes.status < 500 && dlRes.status !== 408 && dlRes.status !== 429) {
            return res.status(200).json({
              status: 'failed',
              error: `Gemini video download was rejected with HTTP ${dlRes.status}.`,
            });
          }
          console.error('Gemini video download server error:', { taskId, index: i, status: dlRes.status });
          return res.status(503).json({
            error: `Gemini video download failed with status ${dlRes.status}. Try again shortly.`,
            retryable: true,
          });
        }

        try {
          buffer = Buffer.from(await dlRes.arrayBuffer());
        } catch (bufErr: any) {
          console.error('Failed to read video arrayBuffer:', { taskId, index: i, error: bufErr?.message || bufErr });
          return res.status(503).json({
            error: 'Failed to read video data. Try again shortly.',
            retryable: true,
          });
        }
      }

      if (!buffer || buffer.length === 0) {
        return res.status(200).json({
          status: 'failed',
          error: 'No video data received from Gemini.',
        });
      }

      const { error: uploadError } = await bucket.upload(storagePath, buffer, {
        contentType: 'video/mp4',
        upsert: true,
      });
      if (uploadError) {
        console.error('Gemini video storage upload failed:', { taskId, index: i, error: uploadError.message });
        return res.status(503).json({
          error: `The generated video could not be saved to media storage: ${uploadError.message}`,
          retryable: true,
        });
      }

      const signed = await bucket.createSignedUrl(storagePath, 86400);
      if (signed.error || !signed.data?.signedUrl) {
        console.error('Gemini video signed URL creation failed:', { taskId, index: i, error: signed.error?.message });
        return res.status(503).json({
          error: 'Access URL for the generated video could not be created. Try again shortly.',
          retryable: true,
        });
      }
      videoUrls.push(signed.data.signedUrl);
    }

    return res.status(200).json({
      status: 'completed',
      progress: 1.0,
      output: videoUrls,
    });
  } catch (error: any) {
    const status = Number(error?.status || error?.statusCode);
    const isTransient = status === 408 || status === 429 || (status >= 500 && status <= 599);
    if (isTransient) {
      return res.status(503).json({
        error: error?.message || 'Gemini video operation check failed temporarily. Try again shortly.',
        retryable: true,
      });
    }
    return res.status(500).json({ error: error?.message || 'Failed to poll Gemini video operation.' });
  }
}
