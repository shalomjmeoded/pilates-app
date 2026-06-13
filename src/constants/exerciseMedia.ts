import type { ImageSourcePropType } from 'react-native';

import exercisesSeed from '../../assets/seed/exercises.json';
import type { Exercise } from '@/types/exercise';

import { EXERCISE_GIF_MANIFEST, EXERCISE_THUMBNAIL_MANIFEST } from './exerciseAssetManifest';

export interface ExerciseMediaEntry {
  thumbnail: ImageSourcePropType | null;
  gif: ImageSourcePropType | null;
  fallback: ImageSourcePropType | null;
}

const STATIC_DEMO_EXERCISE_IDS = new Set<string>([
  '3_4_Sit-Up',
  'Bent-Knee_Hip_Raise',
  'Bird_Dog',
  'Bodyweight_Squat',
  'Bodyweight_Walking_Lunge',
  'Butt_Lift_Bridge',
  'Cat_Cow',
  'Cross-Body_Crunch',
  'Crossover_Reverse_Lunge',
  'Crunch_-_Hands_Overhead',
  'Crunches',
  'Dead_Bug',
  'Decline_Crunch',
  'Decline_Push-Up',
  'Elbow_to_Knee',
  'Flat_Bench_Lying_Leg_Raise',
  'Flutter_Kicks',
  'Freehand_Jump_Squat',
  'Frog_Sit-Ups',
  'Glute_Kickback',
  'Incline_Push-Up',
  'Jackknife_Sit-Up',
  'Leg_Lift',
  'Mountain_Climbers',
  'Oblique_Crunches',
  'Oblique_Crunches_-_On_The_Floor',
  'Pelvic_Tilt_Into_Bridge',
  'Pilates_Hundred',
  'Pilates_Roll_Up',
  'Pilates_Shoulder_Bridge',
  'Pilates_Swan',
  'Pilates_Swimming',
  'Pilates_Teaser',
  'Plank',
  'Push-Up_Wide',
  'Push_Up_to_Side_Plank',
  'Reverse_Crunch',
  'Russian_Twist',
  'Scissor_Kick',
  'Side_Lying_Leg_Lift',
  'Single_Leg_Glute_Bridge',
  'Sit-Up',
  'Step-up_with_Knee_Raise',
  'Superman',
  'Tuck_Crunch',
]);

export const EXERCISE_THUMBNAIL_DIR = 'assets/exercises/thumbnails';
export const EXERCISE_GIF_DIR = 'assets/exercises/gifs';
export const EXERCISE_PLACEHOLDER_DIR = 'assets/exercises/placeholders';

export function getExerciseThumbnailSource(exerciseId: string): ImageSourcePropType | null {
  return EXERCISE_THUMBNAIL_MANIFEST[exerciseId] ?? null;
}

export function getExerciseGifSource(exerciseId: string): ImageSourcePropType | null {
  return EXERCISE_GIF_MANIFEST[exerciseId] ?? getExerciseThumbnailSource(exerciseId);
}

export function hasAnimatedExerciseDemo(exerciseId: string): boolean {
  return Boolean(
    getExerciseThumbnailSource(exerciseId) &&
      EXERCISE_GIF_MANIFEST[exerciseId] &&
      !STATIC_DEMO_EXERCISE_IDS.has(exerciseId),
  );
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
