import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { FITNESS_GOAL_OPTIONS } from '@/onboarding/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function Step10FitnessGoal() {
  const { step, goNext, goBack } = useOnboardingNavigation(9);
  const fitnessGoal = useOnboardingStore((state) => state.draft.fitnessGoal);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);

  const handleNext = () => {
    if (!fitnessGoal) {
      return;
    }

    goNext();
  };

  return (
    <OnboardingShell
      step={step}
      title="Your main goal"
      subtitle="This shapes your daily plan."
      onBack={goBack}
      onNext={handleNext}
      nextDisabled={!fitnessGoal}
      nextDisabledReason="Pick your primary goal to continue."
      centerBody
    >
      {FITNESS_GOAL_OPTIONS.map((option, index) => (
        <OptionCard
          key={option.value}
          index={index}
          label={option.label}
          selected={fitnessGoal === option.value}
          onPress={() =>
            patchDraft({
              fitnessGoal: option.value,
              goalWeightKg: null,
              weightTrajectory: null,
              baselinePlan: null,
            })
          }
        />
      ))}
    </OnboardingShell>
  );
}
