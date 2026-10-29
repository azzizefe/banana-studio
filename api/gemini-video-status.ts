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

      try {
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
          // Validate protocol and host against SSRF: only HTTPS Google Gemini Files endpoint is allowed
          const fetchUrl = new URL(item.video.uri);
          if (fetchUrl.protocol !== 'https:' || fetchUrl.hostname !== 'generativelanguage.googleapis.com') {
            throw new Error('Invalid or unauthorized video download URL from Gemini.');
          }

          // Download via URI using header authentication only (do not expose key in URI)
          const dlRes = await fetch(fetchUrl.toString(), {
            headers: { 'x-goog-api-key': apiKey },
            redirect: 'error',
            signal: AbortSignal.timeout(60_000),
          });
          if (!dlRes.ok) {
            throw new Error(`The generated video could not be downloaded from Gemini (status ${dlRes.status}).`);
          }
          buffer = Buffer.from(await dlRes.arrayBuffer());
        }

        if (!buffer || buffer.length === 0) {
          throw new Error('No video data received from Gemini.');
        }

        const { error: uploadError } = await bucket.upload(storagePath, buffer, {
          contentType: 'video/mp4',
          upsert: true,
        });
        if (uploadError) {
          throw new Error(`The generated video could not be saved to media storage: ${uploadError.message}`);
        }

        const signed = await bucket.createSignedUrl(storagePath, 86400);
        if (signed.error || !signed.data?.signedUrl) {
          throw new Error('Access URL for the generated video could not be created.');
        }
        videoUrls.push(signed.data.signedUrl);
      } catch (storageErr: any) {
        console.error('Gemini video storage failed:', { taskId, index: i, error: storageErr?.message || storageErr });
        return res.status(503).json({
          error: 'Gemini video is ready but could not be stored in media bucket. Try again shortly.',
          retryable: true,
        });
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
