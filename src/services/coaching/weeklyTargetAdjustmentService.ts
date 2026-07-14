import { format } from 'date-fns';

import {
  getWeeklyCoachInsight,
  upsertCoachingInsight,
} from '@/db/repositories/coachingRepository';
import {
  getActiveNutritionTargets,
  syncDailyTotalsForDate,
  upsertNutritionTargets,
} from '@/db/repositories/nutritionRepository';
import { getProfile } from '@/db/repositories/profileRepository';
import { getAllWeightLogs } from '@/db/repositories/weightLogRepository';
import { logSettingChange } from '@/db/repositories/settingsAuditRepository';
import { calculateTdee } from '@/engines/calculations/tdee';
import { calculateBmr } from '@/engines/calculations/bmr';
import { getWeekStartDate } from '@/engines/coaching/weekStart';
import { observeWeeklyWeightPace } from '@/engines/coaching/observeWeeklyWeightPace';
import {
  buildWeeklyTargetAdjustment,
  expectedLossFromDeficit,
} from '@/engines/coaching/weeklyTargetAdjustment';
import { preferencesStorage } from '@/storage/mmkv';
import type { WeeklyTargetAdjustmentRecord } from '@/types/coaching';

export async function getWeeklyTargetAdjustment(
  weekStart: string = getWeekStartDate(),
): Promise<WeeklyTargetAdjustmentRecord | null> {
  const row = await getWeeklyCoachInsight(weekStart);
  return row?.payload.weeklyTargetAdjustment ?? null;
}

/**
 * Once per week: compare observed vs expected loss and adjust calories/macros.
 * Skips when disabled, manual targets, non-loss goals, or already applied this week.
 */
export async function ensureWeeklyTargetAdjustment(options?: {
  force?: boolean;
  weekStart?: string;
}): Promise<WeeklyTargetAdjustmentRecord | null> {
  const weekStart = options?.weekStart ?? getWeekStartDate();
  const existing = await getWeeklyTargetAdjustment(weekStart);
  if (existing && !options?.force) {
    return existing;
  }

  const prefs = preferencesStorage.getCoachNutrition();
  if (!prefs.adjustEnabled) {
    return null;
  }

  const profile = await getProfile();
  if (!profile) {
    return null;
  }

  if (profile.fitnessGoal !== 'lose_weight' && profile.weightTrajectory !== 'weight_loss') {
    return null;
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const targets = await getActiveNutritionTargets(today);
  if (!targets) {
    return null;
  }
  if (targets.isManualOverride) {
    return null;
  }

  const weightLogs = await getAllWeightLogs();
  const observed = observeWeeklyWeightPace(weightLogs);
  if (!observed) {
    return null;
  }

  const { bmr } = calculateBmr({
    genderIdentity: profile.genderIdentity,
    weightKg: profile.currentWeightKg,
    heightCm: profile.heightCm,
    birthYear: profile.birthYear,
  });
  const { tdee } = calculateTdee(bmr, profile.trainingFrequency);
  const dailyDeficit = Math.max(0, tdee - targets.calories);
  const expectedFromDeficit = expectedLossFromDeficit(dailyDeficit);
  const expectedLossKgPerWeek =
    expectedFromDeficit > 0.05 ? expectedFromDeficit : profile.paceKgPerWeek;

  const plan = buildWeeklyTargetAdjustment({
    previous: {
      calories: targets.calories,
      proteinG: targets.proteinG,
      carbsG: targets.carbsG,
      fatG: targets.fatG,
      fiberG: targets.fiberG,
    },
    observedLossKgPerWeek: observed.lossKgPerWeek,
    expectedLossKgPerWeek,
    prefs,
    genderIdentity: profile.genderIdentity,
  });

  if (!plan) {
    return null;
  }

  await upsertNutritionTargets({
    effectiveDate: today,
    calories: plan.next.calories,
    proteinG: plan.next.proteinG,
    carbsG: plan.next.carbsG,
    fatG: plan.next.fatG,
    fiberG: plan.next.fiberG,
    isManualOverride: false,
  });

  await logSettingChange('nutrition_targets_coach_weekly', plan.previous, plan.next);
  await syncDailyTotalsForDate(today);

  const record: WeeklyTargetAdjustmentRecord = {
    weekStart,
    reason: plan.reason,
    observedPaceKgPerWeek: observed.lossKgPerWeek,
    expectedPaceKgPerWeek: expectedLossKgPerWeek,
    calorieDelta: plan.calorieDelta,
    previous: plan.previous,
    next: plan.next,
    appliedAt: new Date().toISOString(),
    message: plan.message,
  };

  const coachingRow = await getWeeklyCoachInsight(weekStart);
  const existingCoach = coachingRow?.payload.weeklyCoach;
  await upsertCoachingInsight({
    id: coachingRow?.id,
    insightDate: weekStart,
    dailyTip: coachingRow?.dailyTip ?? plan.message,
    weeklyInsight: coachingRow?.weeklyInsight,
    payload: {
      ...(coachingRow?.payload ?? {}),
      weeklyTargetAdjustment: record,
      ...(existingCoach
        ? {
            weeklyCoach: {
              ...existingCoach,
              targetAdjustmentSummary: plan.message,
            },
          }
        : null),
    },
  });

  return record;
}
