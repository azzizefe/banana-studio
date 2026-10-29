import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_ROUTES, OPENROUTER_MODELS, resolveProvider } from '../src/lib/providers.ts';
import { getGeminiOmniConfigError, GEMINI_OMNI_SUPPORTED_ASPECT_RATIOS, GEMINI_OMNI_SUPPORTED_QUALITIES, GEMINI_OMNI_SUPPORTED_DURATIONS } from '../src/lib/video/geminiOmni.ts';
import { estimateVideoCost } from '../src/types.ts';

test('gemini-omni-1.1-flash routes and provider resolution', () => {
  assert.deepEqual(MODEL_ROUTES['gemini-omni-1.1-flash'], ['gemini']);
  assert.equal(OPENROUTER_MODELS['gemini-omni-1.1-flash'], undefined);

  // Provider resolution with Gemini key
  assert.equal(resolveProvider('gemini-omni-1.1-flash', 'auto', { gemini: true }), 'gemini');
  assert.equal(resolveProvider('gemini-omni-1.1-flash', 'gemini', { gemini: true }), 'gemini');

  // Throws if Gemini key not available
  assert.throws(() => resolveProvider('gemini-omni-1.1-flash', 'auto', {}), /Add one key/);
  assert.throws(() => resolveProvider('gemini-omni-1.1-flash', 'openrouter', { openrouter: true }), /This provider does not serve the selected model/);
  assert.throws(() => resolveProvider('gemini-omni-1.1-flash', 'fal', { fal: true }));
});

test('gemini-omni-1.1-flash configuration validation', () => {
  assert.equal(getGeminiOmniConfigError('Cinematic camera pan through a neon forest', [], [], '16:9', '720p', 5), undefined);
  assert.equal(getGeminiOmniConfigError('Drone shot over ocean waves', [], [], '9:16', '1080p', 10), undefined);

  // Rejects empty prompt with no media
  assert.ok(getGeminiOmniConfigError('', [], []));

  // Rejects invalid aspect ratio
  assert.ok(getGeminiOmniConfigError('Valid prompt', [], [], '21:9', '720p', 5));

  // Rejects invalid duration
  assert.ok(getGeminiOmniConfigError('Valid prompt', [], [], '16:9', '720p', 15));

  // Rejects too many reference images
  const tooManyImages = Array(6).fill({ id: 'img', data: 'data' });
  assert.ok(getGeminiOmniConfigError('Valid prompt', tooManyImages, [], '16:9', '720p', 5));
});

test('gemini-omni-1.1-flash cost estimation', () => {
  const cost720p = estimateVideoCost('gemini-omni-1.1-flash', '720p', 5, false);
  assert.equal(cost720p.source, 'published_estimate');
  assert.equal(cost720p.usd, 0.008 * 5);

  const cost1080p = estimateVideoCost('gemini-omni-1.1-flash', '1080p', 10, false);
  assert.equal(cost1080p.usd, 0.015 * 10);
});
