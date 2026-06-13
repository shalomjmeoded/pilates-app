import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { GENDER_OPTIONS } from '@/onboarding/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function Step01Gender() {
  const { step, goNext, goBack } = useOnboardingNavigation(1);
  const genderIdentity = useOnboardingStore((state) => state.draft.genderIdentity);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);

  return (
    <OnboardingShell
      step={step}
      title="Welcome — let's find your rhythm"
      subtitle="Tune is inclusive and body-positive. A few gentle questions help us shape movement and nourishment around you."
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
