import { useMemo } from 'react';

import { OnboardingShell, RoadmapChart } from '@/components/onboarding';
import { buildRoadmapProjection } from '@/engines/calculations';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';

export default function Step13Roadmap() {
  const { step, goNext, goBack } = useOnboardingNavigation(14);
  const draft = useOnboardingStore((state) => state.draft);
  const weightUnit = usePreferencesStore((state) => state.preferences.units.weight);

  const points = useMemo(() => {
    if (!draft.currentWeightKg || !draft.weightTrajectory || draft.paceKgPerWeek === null) {
      return buildRoadmapProjection(
        draft.currentWeightKg ?? 68,
        draft.weightTrajectory ?? 'weight_loss',
        draft.paceKgPerWeek ?? 0.5,
      );
    }

    return buildRoadmapProjection(
      draft.currentWeightKg,
      draft.weightTrajectory,
      draft.paceKgPerWeek,
    );
  }, [draft.currentWeightKg, draft.paceKgPerWeek, draft.weightTrajectory]);

  return (
    <OnboardingShell
      step={step}
      title="Your 24-week roadmap"
      subtitle="A projected curve based on your current selections."
      onBack={goBack}
      onNext={goNext}
    >
      <RoadmapChart
        points={points}
        goalWeightKg={draft.goalWeightKg ?? draft.currentWeightKg ?? 0}
        weightUnit={weightUnit}
      />
    </OnboardingShell>
  );
}
