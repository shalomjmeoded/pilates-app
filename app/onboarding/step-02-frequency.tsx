import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { FREQUENCY_OPTIONS } from '@/onboarding/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function Step02Frequency() {
  const { step, goNext, goBack } = useOnboardingNavigation(2);
  const trainingFrequency = useOnboardingStore((state) => state.draft.trainingFrequency);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);

  return (
    <OnboardingShell
      step={step}
      title="How often do you move?"
      subtitle="No judgment — we use this to build a rhythm that fits your real life."
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
