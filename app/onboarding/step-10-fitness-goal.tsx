import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { FITNESS_GOAL_OPTIONS } from '@/onboarding/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function Step10FitnessGoal() {
  const { step, goNext, goBack } = useOnboardingNavigation(9);
  const fitnessGoal = useOnboardingStore((state) => state.draft.fitnessGoal);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);

  return (
    <OnboardingShell
      step={step}
      title="What feels right for your body?"
      subtitle="Your goal shapes workout focus and daily nourishment — without aggressive targets."
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!fitnessGoal}
      nextDisabledReason="Pick your primary goal to continue."
    >
      {FITNESS_GOAL_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          selected={fitnessGoal === option.value}
          onPress={() => patchDraft({ fitnessGoal: option.value })}
        />
      ))}
    </OnboardingShell>
  );
}
