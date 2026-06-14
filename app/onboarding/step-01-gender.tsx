import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { GENDER_OPTIONS } from '@/onboarding/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function Step01Gender() {
  const { step, goNext } = useOnboardingNavigation(1);
  const genderIdentity = useOnboardingStore((state) => state.draft.genderIdentity);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);
  const selectionInsight = genderIdentity ? 'Great choice. We tailor gently.' : undefined;

  return (
    <OnboardingShell
      step={step}
      title="Let&apos;s personalize BetterMe"
      subtitle="A few details help us build your plan."
      heroImageSource={require('../../assets/onboarding/hero-rhythm.png')}
      heroAccessibilityLabel="Pilates lifestyle hero"
      insightText={selectionInsight}
      showBack={false}
      onNext={goNext}
      nextDisabled={!genderIdentity}
    >
      {GENDER_OPTIONS.map((option, index) => (
        <OptionCard
          key={option.value}
          label={option.label}
          index={index}
          selected={genderIdentity === option.value}
          onPress={() => patchDraft({ genderIdentity: option.value })}
        />
      ))}
    </OnboardingShell>
  );
}
