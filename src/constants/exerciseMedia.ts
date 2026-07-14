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

export function getExerciseMediaEntry(exercise: Exercise): ExerciseMediaEntry {
  const thumbnail = getExerciseThumbnailSource(exercise.id);
  const gif = getExerciseGifSource(exercise.id);
  const distinct = Boolean(
    thumbnail && EXERCISE_GIF_MANIFEST[exercise.id] && thumbnail !== EXERCISE_GIF_MANIFEST[exercise.id],
  );

  return {
    thumbnail,
    gif,
    fallback: thumbnail ?? gif,
    hasDistinctMotionFrame: distinct,
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
