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
      title="Your weekly rhythm"
      subtitle="Choose what feels realistic for you."
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!trainingFrequency}
      centerBody
    >
      {FREQUENCY_OPTIONS.map((option, index) => (
        <OptionCard
          key={option.value}
          index={index}
          label={option.label}
          selected={trainingFrequency === option.value}
          onPress={() => patchDraft({ trainingFrequency: option.value })}
        />
      ))}
    </OnboardingShell>
  );
}
