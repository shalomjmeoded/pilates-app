import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { TRAJECTORY_OPTIONS } from '@/onboarding/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function Step12Trajectory() {
  const { step, goNext, goBack } = useOnboardingNavigation(10);
  const weightTrajectory = useOnboardingStore((state) => state.draft.weightTrajectory);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);
  const trajectoryInsight = weightTrajectory
    ? weightTrajectory === 'weight_loss'
      ? 'Gentle cut path selected.'
      : weightTrajectory === 'lean_mass'
        ? 'Lean gain path selected.'
        : 'Steady path selected.'
    : undefined;

  return (
    <OnboardingShell
      step={step}
      title="Your direction"
      subtitle="Choose the path you prefer."
      insightText={trajectoryInsight}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!weightTrajectory}
      nextDisabledReason="Choose a trajectory option to continue."
    >
      {TRAJECTORY_OPTIONS.map((option, index) => (
        <OptionCard
          key={option.value}
          index={index}
          label={option.label}
          selected={weightTrajectory === option.value}
          onPress={() => patchDraft({ weightTrajectory: option.value })}
        />
      ))}
    </OnboardingShell>
  );
}
