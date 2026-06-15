import { CompactYearPicker, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import {
  getBirthYearBounds,
  isBirthYearWithinSupportedAge,
} from '@/onboarding/helpers';
import { useOnboardingStore } from '@/stores/onboardingStore';

const { minYear: MIN_BIRTH_YEAR, maxYear: MAX_BIRTH_YEAR } = getBirthYearBounds();

export default function Step09BirthYear() {
  const { step, goNext, goBack } = useOnboardingNavigation(7);
  const birthYear = useOnboardingStore((state) => state.draft.birthYear);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);
  const birthYearIsValid = birthYear !== null && isBirthYearWithinSupportedAge(birthYear);

  return (
    <OnboardingShell
      step={step}
      title="Birth year"
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!birthYearIsValid}
      nextDisabledReason={`Choose a year between ${MIN_BIRTH_YEAR} and ${MAX_BIRTH_YEAR}.`}
    >
      <CompactYearPicker
        value={birthYear}
        onChange={(year) => patchDraft({ birthYear: year })}
      />
    </OnboardingShell>
  );
}
