import type { ImageSourcePropType } from 'react-native';

import exercisesSeed from '../../assets/seed/exercises.json';
import type { Exercise } from '@/types/exercise';

import { EXERCISE_GIF_MANIFEST, EXERCISE_THUMBNAIL_MANIFEST } from './exerciseAssetManifest';

export interface ExerciseMediaEntry {
  thumbnail: ImageSourcePropType | null;
  gif: ImageSourcePropType | null;
  fallback: ImageSourcePropType | null;
  /** True when gif/webp is distinct from the thumbnail (motion demo available). */
  hasDistinctMotionFrame: boolean;
}

export const EXERCISE_THUMBNAIL_DIR = 'assets/exercises/thumbnails';
export const EXERCISE_GIF_DIR = 'assets/exercises/gifs';
export const EXERCISE_PLACEHOLDER_DIR = 'assets/exercises/placeholders';

/** YouTube storyboard stills — used when bundled thumb/gif are identical JPGs. */
export function getYouTubeFrameSource(
  videoId: string,
  frame: 0 | 1 | 2 | 3 = 0,
): ImageSourcePropType {
  return { uri: `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/${frame}.jpg` };
}

export function getExerciseThumbnailSource(exerciseId: string): ImageSourcePropType | null {
  return EXERCISE_THUMBNAIL_MANIFEST[exerciseId] ?? null;
}

export function getExerciseGifSource(exerciseId: string): ImageSourcePropType | null {
  return EXERCISE_GIF_MANIFEST[exerciseId] ?? getExerciseThumbnailSource(exerciseId);
}

function isNativeAnimatedUri(uri: string | undefined | null): boolean {
  return Boolean(uri && /\.(gif|webp)$/i.test(uri));
}

/**
 * Animate when we have a real GIF/WebP, or a distinct second still for flip-book.
 * Identical stills (same require) will not flip-book.
 */
export function hasAnimatedExerciseDemo(exerciseId: string): boolean {
  const seed = (exercisesSeed as Exercise[]).find((exercise) => exercise.id === exerciseId);
  if (seed && isNativeAnimatedUri(seed.gifUri)) {
    return true;
  }
  const thumbnail = getExerciseThumbnailSource(exerciseId);
  const gif = EXERCISE_GIF_MANIFEST[exerciseId];
  return Boolean(thumbnail && gif && thumbnail !== gif);
}

/** Prefer native GIF/WebP over flip-book when the seed points at an animated file. */
export function prefersNativeGifDemo(exerciseId: string): boolean {
  const seed = (exercisesSeed as Exercise[]).find((exercise) => exercise.id === exerciseId);
  return Boolean(seed && isNativeAnimatedUri(seed.gifUri) && EXERCISE_GIF_MANIFEST[exerciseId]);
}

/**
 * Resolve display media for thumbnails/cards.
 * Prefer bundled exercise photos; never autoplay flip-book or YouTube storyboard animation.
 * Motion demos live in the YouTube embed on detail/player screens.
 */
export function resolveExerciseDisplayMedia(exercise: Exercise): {
  thumbnail: ImageSourcePropType | null;
  motionFrame: ImageSourcePropType | null;
  animate: boolean;
  preferNativeGif: boolean;
  source: 'youtube_frames' | 'bundled_motion' | 'bundled_still' | 'none';
} {
  const bundledThumb = getExerciseThumbnailSource(exercise.id);
  const bundledGif = EXERCISE_GIF_MANIFEST[exercise.id] ?? null;
  const still = bundledThumb ?? bundledGif ?? getExerciseGifSource(exercise.id);

  if (still) {
    return {
      thumbnail: still,
      motionFrame: still,
      animate: false,
      preferNativeGif: false,
      source: 'bundled_still',
    };
  }

  const videoId = exercise.youtubeVideoId?.trim() || null;
  if (videoId) {
    const frame = getYouTubeFrameSource(videoId, 0);
    return {
      thumbnail: frame,
      motionFrame: frame,
      animate: false,
      preferNativeGif: false,
      source: 'youtube_frames',
    };
  }

  return {
    thumbnail: null,
    motionFrame: null,
    animate: false,
    preferNativeGif: false,
    source: 'none',
  };
}

export function getExerciseMediaEntry(exercise: Exercise): ExerciseMediaEntry {
  const resolved = resolveExerciseDisplayMedia(exercise);

  return {
    thumbnail: resolved.thumbnail,
    gif: resolved.motionFrame,
    fallback: resolved.thumbnail ?? resolved.motionFrame,
    hasDistinctMotionFrame: resolved.animate && resolved.thumbnail !== resolved.motionFrame,
  };
}

export const EXERCISE_MEDIA_MAP: Record<string, ExerciseMediaEntry> = Object.fromEntries(
  (exercisesSeed as Exercise[]).map((exercise) => [exercise.id, getExerciseMediaEntry(exercise)]),
);

export function hasBundledThumbnail(exercise: Exercise): boolean {
  return Boolean(getExerciseThumbnailSource(exercise.id));
}

export function hasBundledGif(exercise: Exercise): boolean {
  return Boolean(EXERCISE_GIF_MANIFEST[exercise.id]);
}
