export interface PromptCompilerInput {
  prompt: string;
  filmGenre?: string;
  filmEra?: string;
  filmEraYear?: string;
  filmTempo?: string;
  filmLens?: string;
  cameraMovement?: string;
  colorPalette?: string;
  lighting?: string;
}

/**
 * Compiles director controls (Genre, Era, Tempo, Lens, Camera, Lighting, Color)
 * with the base scene prompt into a unified cinematic prompt optimized for AI video & image models.
 */
export function compileCinematicPrompt(scene: PromptCompilerInput): string {
  const parts: string[] = [];
  const basePrompt = (scene.prompt || '').trim();
  if (basePrompt) {
    parts.push(basePrompt);
  }

  // Genre aesthetic
  if (scene.filmGenre && scene.filmGenre !== 'Auto') {
    parts.push(`Cinematic genre: ${scene.filmGenre} aesthetic`);
  }

  // Era / Year styling
  if (scene.filmEra && scene.filmEra !== 'Auto') {
    const eraText = scene.filmEraYear ? `${scene.filmEraYear} (${scene.filmEra})` : scene.filmEra;
    parts.push(`Period era: ${eraText}, authentic visual styling and production design`);
  }

  // Tempo / Pacing
  if (scene.filmTempo && scene.filmTempo !== 'Auto') {
    parts.push(`Pacing & rhythm: ${scene.filmTempo} tempo`);
  }

  // Camera Optics & Lens
  if (scene.filmLens && scene.filmLens !== 'Auto') {
    parts.push(`Camera optics: shot on ${scene.filmLens}, professional cinematic lens characteristics, natural depth of field`);
  }

  // Camera Motion
  if (scene.cameraMovement && scene.cameraMovement !== 'Auto Camera' && scene.cameraMovement !== 'Auto') {
    parts.push(`Camera movement: ${scene.cameraMovement}`);
  }

  // Lighting & Atmosphere
  if (scene.lighting && scene.lighting !== 'Auto Lighting' && scene.lighting !== 'Auto') {
    parts.push(`Lighting: ${scene.lighting}`);
  }

  // Color Grading
  if (scene.colorPalette && scene.colorPalette !== 'Auto Color' && scene.colorPalette !== 'Auto') {
    parts.push(`Color grading: ${scene.colorPalette}`);
  }

  return parts.join(', ');
}
