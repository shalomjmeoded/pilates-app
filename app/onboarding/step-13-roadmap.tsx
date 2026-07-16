import { useMemo } from 'react';

import { OnboardingShell, RoadmapChart } from '@/components/onboarding';
import {
  buildRoadmapProjection,
  estimateWeeksToGoal,
  formatRoadmapTargetDate,
} from '@/engines/calculations';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { deriveWeightTrajectory } from '@/onboarding/deriveWeightTrajectory';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { buildPersonalizationSummary } from '@/onboarding/personalizationSummary';

export default function Step13Roadmap() {
  const { step, goNext, goBack } = useOnboardingNavigation(13);
  const draft = useOnboardingStore((state) => state.draft);
  const weightUnit = usePreferencesStore((state) => state.preferences.units.weight);

  const currentWeight = draft.currentWeightKg ?? 68;
  const fitnessGoal = draft.fitnessGoal ?? 'get_toned';
  const pace = draft.paceKgPerWeek ?? 0.5;
  const goalWeight = draft.goalWeightKg ?? currentWeight;
  const trajectory = deriveWeightTrajectory(fitnessGoal, currentWeight, goalWeight);

  const weeksToGoal = estimateWeeksToGoal(currentWeight, goalWeight, trajectory, pace);
  const chartWeeks = weeksToGoal === null || weeksToGoal === 0 ? 24 : weeksToGoal;
  const points = useMemo(
    () => buildRoadmapProjection(currentWeight, trajectory, pace, chartWeeks),
    [chartWeeks, currentWeight, pace, trajectory],
  );

  const targetDateLabel = formatRoadmapTargetDate(weeksToGoal);
  const personalizationSummary = buildPersonalizationSummary({
    trainingFrequency: draft.trainingFrequency,
    exercisePreferences: draft.exercisePreferences,
    pace: draft.paceKgPerWeek,
  });

  return (
    <OnboardingShell
      step={step}
      title="Your roadmap"
      subtitle="Preview your milestone journey."
      insightText={personalizationSummary}
      onBack={goBack}
      onNext={goNext}
      scrollFallbackOnCompact
    >
      <RoadmapChart
        points={points}
        goalWeightKg={goalWeight}
        weightUnit={weightUnit}
        targetDateLabel={targetDateLabel}
        goalWeek={weeksToGoal}
      />
    </OnboardingShell>
  );
}
