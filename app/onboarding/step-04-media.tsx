import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { MEDIA_OPTIONS } from '@/onboarding/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function Step04Media() {
  const { step, goNext, goBack } = useOnboardingNavigation(4);
  const mediaPreference = useOnboardingStore((state) => state.draft.mediaPreference);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);

  return (
    <OnboardingShell
      step={step}
      title="How do you like to follow along?"
      subtitle="Pick what feels comfortable — you can change this anytime in Settings."
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!mediaPreference}
      nextDisabledReason="Choose one movement display style to continue."
    >
      {MEDIA_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          description={option.description}
          selected={mediaPreference === option.value}
          onPress={() => patchDraft({ mediaPreference: option.value })}
        />
      ))}
    </OnboardingShell>
  );
}
