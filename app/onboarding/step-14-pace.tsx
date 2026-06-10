import { OnboardingShell, PaceIntensityPicker } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { Pace } from '@/types/profile';

const DEFAULT_PACE: Pace = 0.5;

export default function Step14Pace() {
  const { step, goNext, goBack } = useOnboardingNavigation(15);
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

  return (
    <OnboardingShell
      step={step}
      title="Choose your pace intensity"
      subtitle="Dial it up or down — you can always adjust later."
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
