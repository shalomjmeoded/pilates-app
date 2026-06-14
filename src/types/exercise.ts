import type { ExercisePreference } from './profile';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseFeedback = 'completed' | 'skipped' | 'modified';

export const EXERCISE_MUSCLE_GROUPS = [
  'core',
  'glutes',
  'hamstrings',
  'quadriceps',
  'hip flexors',
  'shoulders',
  'upper back',
  'lower back',
  'inner thighs',
  'outer thighs',
  'arms',
  'full body',
] as const;

export type ExerciseMuscleGroup = (typeof EXERCISE_MUSCLE_GROUPS)[number];

export const EXERCISE_EQUIPMENT = [
  'mat',
  'reformer',
  'resistance band',
  'magic circle',
  'light weights',
  'none',
] as const;

export type ExerciseEquipment = (typeof EXERCISE_EQUIPMENT)[number];

export const EXERCISE_CATEGORIES = [
  'pilates',
  'mobility',
  'flexibility',
  'bodyweight',
  'resistance_band',
  'glutes',
  'posture',
  'core',
] as const;

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export const EXERCISE_SOURCES = ['free_exercise_db', 'generated_betterme'] as const;

export type ExerciseSource = (typeof EXERCISE_SOURCES)[number];

export const EXERCISE_SESSION_ROLES = ['main', 'warmup', 'cooldown'] as const;

export type ExerciseSessionRole = (typeof EXERCISE_SESSION_ROLES)[number];

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  commonMistakes: string[];
  difficulty: Difficulty;
  muscleGroup: ExerciseMuscleGroup;
  secondaryMuscles: ExerciseMuscleGroup[];
  equipment: ExerciseEquipment;
  thumbnailUri: string;
  gifUri: string;
  tags: ExercisePreference[];
  categories: ExerciseCategory[];
  sessionRole: ExerciseSessionRole;
  source: ExerciseSource;
  repsBaseline: number | null;
  holdSeconds: number | null;
  caloriesFactor: number;
}

export interface ExerciseRow {
  id: string;
  name: string;
  description: string;
  instructions_json: string;
  common_mistakes_json: string;
  difficulty: Difficulty;
  muscle_group: ExerciseMuscleGroup;
  secondary_muscles_json: string;
  equipment: ExerciseEquipment;
  reps_baseline: number | null;
  hold_seconds: number | null;
  calories_factor: number;
  thumbnail_uri: string;
  gif_uri: string;
  tags_json: string;
  categories_json: string;
  session_role: ExerciseSessionRole;
  source: ExerciseSource;
}
