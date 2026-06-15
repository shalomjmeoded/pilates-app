import { useEffect } from 'react';

import { HorizontalMeasurementRuler, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import type { FitnessGoal } from '@/types/profile';

const MIN_GOAL_WEIGHT_KG = 35;
const MAX_GOAL_WEIGHT_KG = 250;
const DEFAULT_CURRENT_WEIGHT_KG = 68;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getGoalBounds(fitnessGoal: FitnessGoal | null, currentWeightKg: number): {
  minKg: number;
  maxKg: number;
  subtitle: string;
} {
  if (fitnessGoal === 'lose_weight') {
    return {
      minKg: MIN_GOAL_WEIGHT_KG,
      maxKg: currentWeightKg,
      subtitle: 'Choose a target at or below your current weight.',
    };
  }

  if (fitnessGoal === 'build_muscle') {
    return {
      minKg: currentWeightKg,
      maxKg: MAX_GOAL_WEIGHT_KG,
      subtitle: 'Choose a target at or above your current weight.',
    };
  }

  return {
    minKg: MIN_GOAL_WEIGHT_KG,
    maxKg: MAX_GOAL_WEIGHT_KG,
    subtitle: 'Adjust the scale to set your milestone.',
  };
}

function getDefaultGoalWeight(fitnessGoal: FitnessGoal | null, currentWeightKg: number, minKg: number, maxKg: number): number {
  if (fitnessGoal === 'lose_weight') {
    return clamp(Math.round((currentWeightKg - 5) * 10) / 10, minKg, maxKg);
  }

  if (fitnessGoal === 'build_muscle') {
    return clamp(Math.round((currentWeightKg + 3) * 10) / 10, minKg, maxKg);
  }

  return clamp(currentWeightKg, minKg, maxKg);
}

export default function Step11GoalWeight() {
  const { step, goNext, goBack } = useOnboardingNavigation(9);
  const currentWeightKg = useOnboardingStore((state) => state.draft.currentWeightKg);
  const fitnessGoal = useOnboardingStore((state) => state.draft.fitnessGoal);
  const goalWeightKg = useOnboardingStore((state) => state.draft.goalWeightKg);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);
  const units = usePreferencesStore((state) => state.preferences.units);
  const setUnits = usePreferencesStore((state) => state.setUnits);

  const resolvedCurrentWeightKg = currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG;
  const { minKg, maxKg, subtitle } = getGoalBounds(fitnessGoal, resolvedCurrentWeightKg);
  const defaultGoalWeightKg = getDefaultGoalWeight(fitnessGoal, resolvedCurrentWeightKg, minKg, maxKg);
  const valueKg = goalWeightKg ?? defaultGoalWeightKg;
  const clampedValueKg = clamp(valueKg, minKg, maxKg);
  const goalWeightIsValid = goalWeightKg !== null && goalWeightKg >= minKg && goalWeightKg <= maxKg;

  useEffect(() => {
    if (goalWeightKg === null || goalWeightKg < minKg || goalWeightKg > maxKg) {
      patchDraft({ goalWeightKg: clampedValueKg });
    }
  }, [clampedValueKg, goalWeightKg, maxKg, minKg, patchDraft]);

  return (
    <OnboardingShell
      step={step}
      title="Your goal weight"
      subtitle={subtitle}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!goalWeightIsValid}
      nextDisabledReason={`Choose a goal weight between ${minKg} and ${maxKg} kg.`}
    >
      <HorizontalMeasurementRuler
        valueKg={clampedValueKg}
        minKg={minKg}
        maxKg={maxKg}
        unit={units.weight}
        accessibilityLabel="Goal weight ruler"
        onChangeKg={(kg) => patchDraft({ goalWeightKg: kg })}
        onToggleUnit={() =>
          setUnits({ ...units, weight: units.weight === 'kg' ? 'lb' : 'kg' })
        }
      />
    </OnboardingShell>
  );
}
