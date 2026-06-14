import { useMemo } from 'react';

import { OnboardingShell, RoadmapChart } from '@/components/onboarding';
import {
  buildRoadmapProjection,
  estimateWeeksToGoal,
  formatRoadmapTargetDate,
  roadmapConfidenceLabel,
} from '@/engines/calculations';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';

export default function Step13Roadmap() {
  const { step, goNext, goBack } = useOnboardingNavigation(12);
  const draft = useOnboardingStore((state) => state.draft);
  const weightUnit = usePreferencesStore((state) => state.preferences.units.weight);

  const currentWeight = draft.currentWeightKg ?? 68;
  const trajectory = draft.weightTrajectory ?? 'weight_loss';
  const pace = draft.paceKgPerWeek ?? 0.5;
  const goalWeight = draft.goalWeightKg ?? currentWeight;

  const points = useMemo(
    () => buildRoadmapProjection(currentWeight, trajectory, pace),
    [currentWeight, pace, trajectory],
  );

  const weeksToGoal = estimateWeeksToGoal(currentWeight, goalWeight, trajectory, pace);
  const targetDateLabel = formatRoadmapTargetDate(weeksToGoal);
  const confidenceLabel = roadmapConfidenceLabel(trajectory, pace);
  const roadmapInsight =
    weeksToGoal === null ? 'Consistency-first path ready.' : `Milestone in ~${weeksToGoal} weeks.`;

  return (
    <OnboardingShell
      step={step}
      title="Your roadmap"
      subtitle="Preview your milestone journey."
      heroImageSource={require('../../assets/onboarding/hero-goals.png')}
      heroAccessibilityLabel="Pilates roll up pose"
      insightText={roadmapInsight}
      onBack={goBack}
      onNext={goNext}
    >
      <RoadmapChart
        points={points}
        goalWeightKg={goalWeight}
        weightUnit={weightUnit}
        targetDateLabel={targetDateLabel}
        confidenceLabel={confidenceLabel}
      />
    </OnboardingShell>
  );
}
