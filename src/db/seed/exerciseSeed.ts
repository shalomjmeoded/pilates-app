import seedData from '../../../assets/seed/exercises.json';
import {
  countExercises,
  insertExercises,
  replaceExerciseLibrary,
} from '@/db/repositories/exerciseRepository';
import { ensurePremiumStatusRow } from '@/db/repositories/premiumRepository';
import { normalizePilatesExercise } from '@/engines/workout/pilatesExerciseCatalog';
import { refreshWorkoutPlanForDate } from '@/engines/workout/repairStalePlan';
import { formatPlanDate } from '@/engines/workout/ensureDailyPlan';
import { getSessionForPlan, getWorkoutPlanByDate } from '@/db/repositories/workoutRepository';
import { preferencesStorage } from '@/storage/mmkv';
import type { Exercise } from '@/types/exercise';

export const EXERCISE_LIBRARY_VERSION = 6;
const LIBRARY_VERSION_KEY = 'exercise_library_version';
const LIBRARY_MIN = 120;
const LIBRARY_MAX = 200;

function needsReseed(existingCount: number, storedVersion: number | undefined): boolean {
  if (storedVersion !== EXERCISE_LIBRARY_VERSION) {
    return true;
  }
  if (existingCount === 0) {
    return true;
  }
  return existingCount < LIBRARY_MIN || existingCount > LIBRARY_MAX;
}

export async function seedDatabaseIfNeeded(): Promise<{ exerciseCount: number; seeded: boolean }> {
  await ensurePremiumStatusRow();

  const existingCount = await countExercises();
  const flags = preferencesStorage.getCachedFlags();
  const storedVersion =
    typeof flags[LIBRARY_VERSION_KEY] === 'number' ? flags[LIBRARY_VERSION_KEY] : undefined;

  if (!needsReseed(existingCount, storedVersion)) {
    return { exerciseCount: existingCount, seeded: false };
  }

  const exercises = (seedData as Exercise[]).map(normalizePilatesExercise);

  if (existingCount > 0) {
    await replaceExerciseLibrary(exercises);
  } else {
    await insertExercises(exercises);
  }

  preferencesStorage.setCachedFlag(LIBRARY_VERSION_KEY, EXERCISE_LIBRARY_VERSION);

  const today = formatPlanDate(new Date());
  const todaysPlan = await getWorkoutPlanByDate(today);
  if (todaysPlan) {
    const session = await getSessionForPlan(todaysPlan.id);
    if (session?.status !== 'in_progress') {
      await refreshWorkoutPlanForDate(today);
    }
  }

  return { exerciseCount: exercises.length, seeded: true };
}
