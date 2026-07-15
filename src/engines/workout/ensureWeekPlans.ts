import { getProfile } from '@/db/repositories/profileRepository';
import {
  getSessionForPlan,
  getWorkoutPlanByDate,
  deleteWorkoutPlanByDate,
} from '@/db/repositories/workoutRepository';
import { preferencesStorage } from '@/storage/mmkv';

import { ensureWorkoutPlanForDate } from './ensureDailyPlan';
import { getScheduledWorkoutDatesForWeek, getWeekDates } from './weeklySchedule';

/** Bump to force one-time regen of unlocked week plans (diversity / schedule changes). */
export const PLAN_DIVERSITY_VERSION = 2;
const PLAN_DIVERSITY_KEY = 'plan_diversity_version';

export async function ensureWeekWorkoutPlans(weekStart: string): Promise<{
  weekStart: string;
  workoutDates: string[];
  restDates: string[];
  ensured: string[];
  regenerated: string[];
}> {
  const profile = await getProfile();
  if (!profile) {
    return {
      weekStart,
      workoutDates: [],
      restDates: getWeekDates(weekStart),
      ensured: [],
      regenerated: [],
    };
  }

  const weekDates = getWeekDates(weekStart);
  const workoutDates = getScheduledWorkoutDatesForWeek(weekStart, profile.trainingFrequency);
  const workoutSet = new Set(workoutDates);
  const restDates = weekDates.filter((date) => !workoutSet.has(date));
  const ensured: string[] = [];
  const regenerated: string[] = [];

  const flags = preferencesStorage.getCachedFlags();
  const storedDiversity =
    typeof flags[PLAN_DIVERSITY_KEY] === 'number' ? flags[PLAN_DIVERSITY_KEY] : undefined;
  const shouldRefreshForDiversity = storedDiversity !== PLAN_DIVERSITY_VERSION;

  for (const planDate of workoutDates) {
    const existing = await getWorkoutPlanByDate(planDate);
    if (existing && shouldRefreshForDiversity) {
      const session = await getSessionForPlan(existing.id);
      if (!session || session.status === 'abandoned') {
        await deleteWorkoutPlanByDate(planDate);
        regenerated.push(planDate);
      }
    }

    await ensureWorkoutPlanForDate(planDate, undefined, { allowFutureGeneration: true });
    ensured.push(planDate);
  }

  if (shouldRefreshForDiversity) {
    preferencesStorage.setCachedFlag(PLAN_DIVERSITY_KEY, PLAN_DIVERSITY_VERSION);
  }

  return { weekStart, workoutDates, restDates, ensured, regenerated };
}
