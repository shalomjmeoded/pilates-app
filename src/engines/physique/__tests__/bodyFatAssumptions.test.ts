import { buildCalculationInput, midpointBodyFatPercent } from '../bodyFatAssumptions';
import type { Profile } from '@/types/profile';
import type { StoredPhysiqueAssessment } from '@/types/physiqueAssessment';

const profile: Profile = {
  genderIdentity: 'male',
  birthYear: 1990,
  heightCm: 180,
  currentWeightKg: 80,
  goalWeightKg: 75,
  trainingFrequency: '3_4',
  fitnessGoal: 'build_muscle',
  exercisePreferences: ['mat_pilates'],
  mediaPreference: 'video_streaming',
  nutritionMode: 'full_tracking',
  weightTrajectory: 'lean_mass',
  paceKgPerWeek: 0.5,
};

const assessment: StoredPhysiqueAssessment = {
  id: 'a1',
  assessedAt: '2026-06-09T12:00:00.000Z',
  physiqueCategory: 'lean',
  estimatedBodyFatRange: { minPercent: 8, maxPercent: 12 },
  confidence: 'high',
  nutritionAdjustmentSuggestion: 'n/a',
  workoutFocusSuggestion: 'n/a',
  disclaimerAcceptedAt: '2026-06-09T12:00:00.000Z',
};

describe('bodyFatAssumptions', () => {
  it('uses midpoint of saved assessment range', () => {
    expect(midpointBodyFatPercent(assessment.estimatedBodyFatRange)).toBe(10);
  });

  it('adds bodyFatPercent to calculation input when assessment exists', () => {
    expect(buildCalculationInput(profile, assessment).bodyFatPercent).toBe(10);
    expect(buildCalculationInput(profile, null).bodyFatPercent).toBeUndefined();
  });
});
