import test from 'node:test';
import assert from 'node:assert/strict';
import { compileCinematicPrompt } from '../src/lib/cinema/promptCompiler.ts';

test('compileCinematicPrompt combines base prompt with director settings', () => {
  const result = compileCinematicPrompt({
    prompt: 'Two detectives walking through rain',
    filmGenre: 'Noir',
    filmEra: '2090s+',
    filmEraYear: '2099',
    filmTempo: 'Chaotic',
    filmLens: '35mm Anamorphic',
    cameraMovement: 'Dolly In (Push)',
    lighting: 'Volumetric God Rays',
    colorPalette: 'Cyberpunk Neon',
  });

  assert.ok(result.includes('Two detectives walking through rain'));
  assert.ok(result.includes('Noir'));
  assert.ok(result.includes('2099'));
  assert.ok(result.includes('Chaotic'));
  assert.ok(result.includes('35mm Anamorphic'));
  assert.ok(result.includes('Dolly In (Push)'));
  assert.ok(result.includes('Volumetric God Rays'));
  assert.ok(result.includes('Cyberpunk Neon'));
});

test('compileCinematicPrompt ignores Auto settings', () => {
  const result = compileCinematicPrompt({
    prompt: 'Space station orbit',
    filmGenre: 'Auto',
    filmEra: 'Auto',
    filmTempo: 'Auto',
    filmLens: 'Auto',
    cameraMovement: 'Auto Camera',
    lighting: 'Auto Lighting',
    colorPalette: 'Auto Color',
  });

  assert.equal(result, 'Space station orbit');
});

