import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { GENDER_OPTIONS } from '@/onboarding/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function Step01Gender() {
  const { step, goNext, goBack } = useOnboardingNavigation(2);
  const genderIdentity = useOnboardingStore((state) => state.draft.genderIdentity);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);

  return (
    <OnboardingShell
      step={step}
      title="How do you identify?"
      subtitle="Tune is inclusive. This helps personalize your energy calculations."
      onBack={goBack}
      showBack={false}
      onNext={goNext}
      nextDisabled={!genderIdentity}
    >
      {GENDER_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          selected={genderIdentity === option.value}
          onPress={() => patchDraft({ genderIdentity: option.value })}
        />
      ))}
    </OnboardingShell>
  );
}
