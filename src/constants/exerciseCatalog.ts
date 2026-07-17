import exerciseSeed from '../../assets/seed/exercises.json';

import type { Exercise } from '@/types/exercise';

export const CURATED_EXERCISE_IDS = (exerciseSeed as Exercise[]).map((exercise) => exercise.id);

