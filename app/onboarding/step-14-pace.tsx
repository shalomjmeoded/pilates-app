import { OnboardingShell, PaceIntensityPicker } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { Pace } from '@/types/profile';

const DEFAULT_PACE: Pace = 0.5;

export default function Step14Pace() {
  const { step, goNext, goBack } = useOnboardingNavigation(11);
  const paceKgPerWeek = useOnboardingStore((state) => state.draft.paceKgPerWeek);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);
  const buildPlanFromDraft = useOnboardingStore((state) => state.buildPlanFromDraft);

  const handleNext = () => {
    if (paceKgPerWeek === null) {
      patchDraft({ paceKgPerWeek: DEFAULT_PACE });
    }
    buildPlanFromDraft();
    goNext();
  };

  const paceInsight = paceKgPerWeek
    ? paceKgPerWeek === 0.25
      ? 'Relaxed pace selected.'
      : paceKgPerWeek === 0.5
        ? 'Moderate pace selected.'
        : 'Fast pace selected.'
    : 'Moderate pace selected.';

  return (
    <OnboardingShell
      step={step}
      title="Your pace"
      subtitle="Gentle, moderate, or strong."
      insightText={paceInsight}
      onBack={goBack}
      onNext={handleNext}
    >
      <PaceIntensityPicker
        value={paceKgPerWeek ?? DEFAULT_PACE}
        onChange={(pace) => patchDraft({ paceKgPerWeek: pace })}
      />
    </OnboardingShell>
  );
}
