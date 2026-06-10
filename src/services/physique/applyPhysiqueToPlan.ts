import { format } from 'date-fns';

import { getActiveNutritionTargets } from '@/db/repositories/nutritionRepository';
import { getProfile } from '@/db/repositories/profileRepository';
import { getWorkoutPlanByDate, getSessionForPlan } from '@/db/repositories/workoutRepository';
import { formatPlanDate } from '@/engines/workout/ensureDailyPlan';
import { refreshWorkoutPlanForDate } from '@/engines/workout/repairStalePlan';
import { recalibrateFromProfile } from '@/services/recalibration/recalibrateProfile';

export async function applyPhysiqueAssessmentToPlans(): Promise<void> {
  const profile = await getProfile();
  if (!profile) {
    return;
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const targets = await getActiveNutritionTargets(today);
  if (!targets?.isManualOverride) {
    await recalibrateFromProfile(profile);
  }

  const plan = await getWorkoutPlanByDate(formatPlanDate(new Date()));
  if (!plan) {
    return;
  }

  const session = await getSessionForPlan(plan.id);
  if (session?.status === 'in_progress') {
    return;
  }

  await refreshWorkoutPlanForDate(plan.planDate);
}
