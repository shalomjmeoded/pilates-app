import type { ImageSourcePropType } from 'react-native';

import exercisesSeed from '../../assets/seed/exercises.json';
import type { Exercise } from '@/types/exercise';

import { EXERCISE_GIF_MANIFEST, EXERCISE_THUMBNAIL_MANIFEST } from './exerciseAssetManifest';

export interface ExerciseMediaEntry {
  thumbnail: ImageSourcePropType | null;
  gif: ImageSourcePropType | null;
  fallback: ImageSourcePropType | null;
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

export function getExerciseMediaEntry(exercise: Exercise): ExerciseMediaEntry {
  const thumbnail = getExerciseThumbnailSource(exercise.id);
  const gif = getExerciseGifSource(exercise.id);

  return {
    thumbnail,
    gif,
    fallback: thumbnail ?? gif,
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
