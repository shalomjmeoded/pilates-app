import { OnboardingShell, PaceIntensityPicker } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { Pace } from '@/types/profile';

const DEFAULT_PACE: Pace = 0.5;

export default function Step14Pace() {
  const { step, goNext, goBack } = useOnboardingNavigation(11);
  const paceKgPerWeek = useOnboardingStore((state) => state.draft.paceKgPerWeek);
  const fitnessGoal = useOnboardingStore((state) => state.draft.fitnessGoal);
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
      title={fitnessGoal === 'maintain' || fitnessGoal === 'get_toned' ? 'Your intensity' : 'Your pace'}
      subtitle={
        fitnessGoal === 'maintain' || fitnessGoal === 'get_toned'
          ? 'Choose how challenging your weekly plan should feel.'
          : 'Gentle, moderate, or strong.'
      }
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
