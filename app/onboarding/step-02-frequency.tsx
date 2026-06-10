import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { FREQUENCY_OPTIONS } from '@/onboarding/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function Step02Frequency() {
  const { step, goNext, goBack } = useOnboardingNavigation(3);
  const trainingFrequency = useOnboardingStore((state) => state.draft.trainingFrequency);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);

  return (
    <OnboardingShell
      step={step}
      title="How often do you train?"
      subtitle="We use this for your daily energy target."
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!trainingFrequency}
    >
      {FREQUENCY_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          selected={trainingFrequency === option.value}
          onPress={() => patchDraft({ trainingFrequency: option.value })}
        />
      ))}
    </OnboardingShell>
  );
}
