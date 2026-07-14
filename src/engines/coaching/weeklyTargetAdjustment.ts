import {
  KCAL_PER_KG_FAT,
  MIN_AUTO_CALORIE_TARGET,
} from '@/engines/calculations/constants';
import { getCalorieSafetyThreshold } from '@/engines/calculations/safety';
import type { CoachDeficitCutPreference, CoachNutritionPreferences } from '@/types/preferences';
import type { GenderIdentity } from '@/types/profile';
import type { WeeklyTargetAdjustmentReason } from '@/types/coaching';

export const TOO_FAST_RATIO = 1.5;
export const TOO_SLOW_RATIO = 0.5;
export const MAX_WEEKLY_CALORIE_DELTA = 200;
export const BASE_WEEKLY_CALORIE_DELTA = 100;

const MIN_FAT_G = 30;
const MIN_CARBS_G = 40;
const KCAL_PER_G_CARBS = 4;
const KCAL_PER_G_FAT = 9;

export interface MacroSnapshot {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface WeeklyTargetAdjustmentPlan {
  reason: WeeklyTargetAdjustmentReason;
  calorieDelta: number;
  previous: MacroSnapshot;
  next: MacroSnapshot;
  message: string;
}

export interface BuildWeeklyTargetAdjustmentInput {
  previous: MacroSnapshot;
  observedLossKgPerWeek: number;
  expectedLossKgPerWeek: number;
  prefs: CoachNutritionPreferences;
  genderIdentity: GenderIdentity;
}

export function classifyPaceRatio(
  observedLossKgPerWeek: number,
  expectedLossKgPerWeek: number,
): WeeklyTargetAdjustmentReason | 'on_track' | 'insufficient' {
  if (expectedLossKgPerWeek <= 0.05) {
    return 'insufficient';
  }
  const ratio = observedLossKgPerWeek / expectedLossKgPerWeek;
  if (ratio >= TOO_FAST_RATIO) {
    return 'too_fast';
  }
  if (ratio <= TOO_SLOW_RATIO) {
    return 'too_slow';
  }
  return 'on_track';
}

export function scaleCalorieDelta(
  observedLossKgPerWeek: number,
  expectedLossKgPerWeek: number,
): number {
  if (expectedLossKgPerWeek <= 0) {
    return 0;
  }
  const ratio = observedLossKgPerWeek / expectedLossKgPerWeek;
  const miss = Math.abs(1 - ratio) / TOO_SLOW_RATIO;
  return Math.min(
    MAX_WEEKLY_CALORIE_DELTA,
    Math.max(BASE_WEEKLY_CALORIE_DELTA, Math.round(BASE_WEEKLY_CALORIE_DELTA * miss)),
  );
}

function applyIncrease(previous: MacroSnapshot, deltaKcal: number): MacroSnapshot {
  const nextCalories = previous.calories + deltaKcal;
  // Split surplus evenly between carbs and fat by calories.
  const carbAdd = Math.round(deltaKcal / 2 / KCAL_PER_G_CARBS);
  const fatAdd = Math.round(deltaKcal / 2 / KCAL_PER_G_FAT);
  return {
    calories: nextCalories,
    proteinG: previous.proteinG,
    carbsG: previous.carbsG + carbAdd,
    fatG: previous.fatG + fatAdd,
    fiberG: previous.fiberG,
  };
}

function applyDecrease(
  previous: MacroSnapshot,
  deltaKcal: number,
  cutPreference: CoachDeficitCutPreference,
  floorCalories: number,
): MacroSnapshot {
  const nextCalories = Math.max(floorCalories, previous.calories - deltaKcal);
  const actualCut = previous.calories - nextCalories;
  if (actualCut <= 0) {
    return { ...previous };
  }

  let carbsG = previous.carbsG;
  let fatG = previous.fatG;

  if (cutPreference === 'carbs') {
    const carbCut = Math.min(carbsG - MIN_CARBS_G, Math.round(actualCut / KCAL_PER_G_CARBS));
    carbsG = Math.max(MIN_CARBS_G, carbsG - Math.max(0, carbCut));
    const remaining = actualCut - Math.max(0, carbCut) * KCAL_PER_G_CARBS;
    if (remaining > 0) {
      const fatCut = Math.min(fatG - MIN_FAT_G, Math.round(remaining / KCAL_PER_G_FAT));
      fatG = Math.max(MIN_FAT_G, fatG - Math.max(0, fatCut));
    }
  } else if (cutPreference === 'fat') {
    const fatCut = Math.min(fatG - MIN_FAT_G, Math.round(actualCut / KCAL_PER_G_FAT));
    fatG = Math.max(MIN_FAT_G, fatG - Math.max(0, fatCut));
    const remaining = actualCut - Math.max(0, fatCut) * KCAL_PER_G_FAT;
    if (remaining > 0) {
      const carbCut = Math.min(carbsG - MIN_CARBS_G, Math.round(remaining / KCAL_PER_G_CARBS));
      carbsG = Math.max(MIN_CARBS_G, carbsG - Math.max(0, carbCut));
    }
  } else {
    const carbCut = Math.min(
      carbsG - MIN_CARBS_G,
      Math.round(actualCut / 2 / KCAL_PER_G_CARBS),
    );
    const fatCut = Math.min(fatG - MIN_FAT_G, Math.round(actualCut / 2 / KCAL_PER_G_FAT));
    carbsG = Math.max(MIN_CARBS_G, carbsG - Math.max(0, carbCut));
    fatG = Math.max(MIN_FAT_G, fatG - Math.max(0, fatCut));
  }

  const recomputed =
    previous.proteinG * 4 + carbsG * KCAL_PER_G_CARBS + fatG * KCAL_PER_G_FAT;

  return {
    calories: Math.max(floorCalories, Math.round(Math.min(nextCalories, recomputed))),
    proteinG: previous.proteinG,
    carbsG,
    fatG,
    fiberG: previous.fiberG,
  };
}

export function buildWeeklyTargetAdjustment(
  input: BuildWeeklyTargetAdjustmentInput,
): WeeklyTargetAdjustmentPlan | null {
  const { previous, observedLossKgPerWeek, expectedLossKgPerWeek, prefs, genderIdentity } =
    input;

  if (!prefs.adjustEnabled) {
    return null;
  }

  const classification = classifyPaceRatio(observedLossKgPerWeek, expectedLossKgPerWeek);
  if (classification === 'on_track' || classification === 'insufficient') {
    return null;
  }

  const magnitude = scaleCalorieDelta(observedLossKgPerWeek, expectedLossKgPerWeek);
  const safetyFloor = Math.max(
    MIN_AUTO_CALORIE_TARGET,
    prefs.calorieSafeguardEnabled
      ? getCalorieSafetyThreshold(genderIdentity)
      : MIN_AUTO_CALORIE_TARGET,
  );

  if (classification === 'too_fast') {
    if (!prefs.allowIncrease) {
      return null;
    }
    const next = applyIncrease(previous, magnitude);
    return {
      reason: 'too_fast',
      calorieDelta: next.calories - previous.calories,
      previous,
      next,
      message: `Your pace was ahead of plan — we gently raised calories from ${previous.calories} to ${next.calories} to support sustainable progress.`,
    };
  }

  if (!prefs.allowDecrease) {
    return null;
  }

  const next = applyDecrease(
    previous,
    magnitude,
    prefs.deficitCutPreference,
    safetyFloor,
  );
  if (next.calories >= previous.calories) {
    return null;
  }

  return {
    reason: 'too_slow',
    calorieDelta: next.calories - previous.calories,
    previous,
    next,
    message: `Progress slowed vs plan — we nudged calories from ${previous.calories} to ${next.calories} (never below your safeguard floor of ${safetyFloor} kcal).`,
  };
}

/** Expected weekly fat loss from a daily calorie deficit. */
export function expectedLossFromDeficit(dailyDeficitKcal: number): number {
  if (dailyDeficitKcal <= 0) {
    return 0;
  }
  return (dailyDeficitKcal * 7) / KCAL_PER_KG_FAT;
}
