import { format } from 'date-fns';

import { logSettingChange } from '@/db/repositories/settingsAuditRepository';
import {
  getActiveNutritionTargets,
  syncDailyTotalsForDate,
  upsertNutritionTargets,
} from '@/db/repositories/nutritionRepository';
import { getProfile, saveProfile } from '@/db/repositories/profileRepository';
import { buildBaselinePlan } from '@/engines/calculations';
import { buildCalculationInput } from '@/engines/physique/bodyFatAssumptions';
import { getLatestPhysiqueAssessment } from '@/db/repositories/physiqueAssessmentRepository';
import type { MacroTotals } from '@/types/nutrition';
import type { Profile } from '@/types/profile';
import type { RecalibrationComparison } from '@/types/settings';

function toMacroTotals(targets: {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}): MacroTotals {
  return {
    calories: targets.calories,
    proteinG: targets.proteinG,
    carbsG: targets.carbsG,
    fatG: targets.fatG,
    fiberG: targets.fiberG,
  };
}

export async function recalibrateFromProfile(profile: Profile): Promise<RecalibrationComparison> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const previousTargets = await getActiveNutritionTargets(today);
  const previous = previousTargets
    ? toMacroTotals(previousTargets)
    : { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 };

  const before = await getProfile();
  await saveProfile(profile);
  await logSettingChange('profile', before, profile);

  const latestPhysique = await getLatestPhysiqueAssessment();
  const plan = buildBaselinePlan(buildCalculationInput(profile, latestPhysique));

  const next = toMacroTotals(plan.macros);

  await upsertNutritionTargets({
    ...plan.macros,
    effectiveDate: today,
    isManualOverride: false,
  });

  await logSettingChange('nutrition_targets', previous, next);
  await syncDailyTotalsForDate(today);

  return { previous, next };
}

export async function saveManualNutritionTargets(
  targets: MacroTotals,
  profile: Profile,
): Promise<RecalibrationComparison> {
  const today = format(new Date(), 'yyyy-MM-dd');
  const previousTargets = await getActiveNutritionTargets(today);
  const previous = previousTargets
    ? toMacroTotals(previousTargets)
    : { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 };

  await upsertNutritionTargets({
    effectiveDate: today,
    calories: targets.calories,
    proteinG: targets.proteinG,
    carbsG: targets.carbsG,
    fatG: targets.fatG,
    fiberG: targets.fiberG,
    isManualOverride: true,
  });

  await logSettingChange('nutrition_targets_manual', previous, targets);
  await syncDailyTotalsForDate(today);

  return { previous, next: targets };
}

export async function restoreAutoNutritionTargets(profile: Profile): Promise<RecalibrationComparison> {
  return recalibrateFromProfile(profile);
}
