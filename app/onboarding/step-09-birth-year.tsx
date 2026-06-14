import { useEffect } from 'react';

import { CompactYearPicker, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import {
  getBirthYearBounds,
  isBirthYearWithinSupportedAge,
  MIN_SUPPORTED_AGE,
  MAX_SUPPORTED_AGE,
} from '@/onboarding/helpers';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Text } from '@/components/ui/Text';

const { minYear: MIN_BIRTH_YEAR, maxYear: MAX_BIRTH_YEAR } = getBirthYearBounds();
const DEFAULT_BIRTH_YEAR = 1996;

export default function Step09BirthYear() {
  const { step, goNext, goBack } = useOnboardingNavigation(7);
  const birthYear = useOnboardingStore((state) => state.draft.birthYear);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);

  useEffect(() => {
    if (!birthYear || !isBirthYearWithinSupportedAge(birthYear)) {
      patchDraft({ birthYear: DEFAULT_BIRTH_YEAR });
    }
  }, [birthYear, patchDraft]);

  const resolvedBirthYear = birthYear && isBirthYearWithinSupportedAge(birthYear)
    ? birthYear
    : DEFAULT_BIRTH_YEAR;
  const currentYear = new Date().getFullYear();
  const age = currentYear - resolvedBirthYear;

  return (
    <OnboardingShell
      step={step}
      title="Birth year"
      subtitle="Used only for safe targets."
      insightText={`Age ${age}. Private on device.`}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!isBirthYearWithinSupportedAge(resolvedBirthYear)}
      nextDisabledReason={`Choose a year between ${MIN_BIRTH_YEAR} and ${MAX_BIRTH_YEAR}.`}
    >
      <CompactYearPicker
        value={resolvedBirthYear}
        onChange={(year) => patchDraft({ birthYear: year })}
      />
      <Text variant="caption">
        Supports ages {MIN_SUPPORTED_AGE}–{MAX_SUPPORTED_AGE}.
      </Text>
    </OnboardingShell>
  );
}
