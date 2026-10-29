import type { ReferenceImage, ReferenceVideo, VideoAspectRatio, VideoQuality, VideoDuration } from '../../types.js';

export const GEMINI_OMNI_SUPPORTED_ASPECT_RATIOS: VideoAspectRatio[] = ['16:9', '9:16', '1:1', '4:3', '3:4'];
export const GEMINI_OMNI_SUPPORTED_QUALITIES: VideoQuality[] = ['720p', '1080p'];
export const GEMINI_OMNI_SUPPORTED_DURATIONS: VideoDuration[] = [5, 10];

export interface GeminiOmniConfig {
  aspectRatio: VideoAspectRatio;
  quality: VideoQuality;
  duration: VideoDuration;
}

export const getGeminiOmniConfigError = (
  prompt: string,
  images: ReferenceImage[] = [],
  videos: ReferenceVideo[] = [],
  aspectRatio?: VideoAspectRatio,
  quality?: VideoQuality,
  duration?: VideoDuration,
): string | undefined => {
  if (!prompt.trim() && images.length === 0) {
    return 'Enter a prompt or attach a reference image to generate with Gemini Omni.';
  }
  if (videos.length > 0) {
    return 'Gemini Omni does not support reference videos.';
  }
  if (images.length > 1) {
    return 'Gemini Omni supports at most 1 reference image.';
  }
  if (aspectRatio && !GEMINI_OMNI_SUPPORTED_ASPECT_RATIOS.includes(aspectRatio)) {
    return `Gemini Omni supports aspect ratios: ${GEMINI_OMNI_SUPPORTED_ASPECT_RATIOS.join(', ')}.`;
  }
  if (quality && !GEMINI_OMNI_SUPPORTED_QUALITIES.includes(quality)) {
    return `Gemini Omni supports resolutions: ${GEMINI_OMNI_SUPPORTED_QUALITIES.join(', ')}.`;
  }
  if (duration && !GEMINI_OMNI_SUPPORTED_DURATIONS.includes(duration)) {
    return 'Gemini Omni supports durations of 5s or 10s.';
  }
  return undefined;
};
