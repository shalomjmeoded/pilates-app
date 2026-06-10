import type { CalculationInput } from '@/types/calculations';
import type { Profile } from '@/types/profile';
import type { BodyFatRange, StoredPhysiqueAssessment } from '@/types/physiqueAssessment';

export function midpointBodyFatPercent(range: BodyFatRange): number {
  return Math.round((range.minPercent + range.maxPercent) / 2);
}

export function calculateLeanMassKg(weightKg: number, bodyFatPercent: number): number {
  return weightKg * (1 - bodyFatPercent / 100);
}

export function assumedBodyFatPercent(
  assessment: StoredPhysiqueAssessment | null | undefined,
): number | undefined {
  if (!assessment) {
    return undefined;
  }

  return midpointBodyFatPercent(assessment.estimatedBodyFatRange);
}

export function buildCalculationInput(
  profile: Profile,
  assessment?: StoredPhysiqueAssessment | null,
): CalculationInput {
  const bodyFatPercent = assumedBodyFatPercent(assessment ?? null);

  return {
    genderIdentity: profile.genderIdentity,
    birthYear: profile.birthYear,
    heightCm: profile.heightCm,
    currentWeightKg: profile.currentWeightKg,
    goalWeightKg: profile.goalWeightKg,
    trainingFrequency: profile.trainingFrequency,
    fitnessGoal: profile.fitnessGoal,
    weightTrajectory: profile.weightTrajectory,
    paceKgPerWeek: profile.paceKgPerWeek,
    bodyFatPercent,
  };
}
