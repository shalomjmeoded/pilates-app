import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { TRAJECTORY_OPTIONS } from '@/onboarding/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function Step12Trajectory() {
  const { step, goNext, goBack } = useOnboardingNavigation(11);
  const weightTrajectory = useOnboardingStore((state) => state.draft.weightTrajectory);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);

  return (
    <OnboardingShell
      step={step}
      title="Which path feels sustainable?"
      subtitle="Choose the direction that honors your lifestyle — change is allowed anytime."
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!weightTrajectory}
      nextDisabledReason="Choose a trajectory option to continue."
    >
      {TRAJECTORY_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          description={option.description}
          selected={weightTrajectory === option.value}
          onPress={() => patchDraft({ weightTrajectory: option.value })}
        />
      ))}
    </OnboardingShell>
  );
}
