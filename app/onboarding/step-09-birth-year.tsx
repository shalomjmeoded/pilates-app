import { useEffect } from 'react';

import { CompactYearPicker, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';

const DEFAULT_YEAR = 1994;

export default function Step09BirthYear() {
  const { step, goNext, goBack } = useOnboardingNavigation(8);
  const birthYear = useOnboardingStore((state) => state.draft.birthYear);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);
  const selectedYear = birthYear ?? DEFAULT_YEAR;

  useEffect(() => {
    if (!birthYear) {
      patchDraft({ birthYear: DEFAULT_YEAR });
    }
  }, [birthYear, patchDraft]);

  return (
    <OnboardingShell
      step={step}
      title="Birth year"
      subtitle="Used only on-device for age-based calculations."
      onBack={goBack}
      onNext={goNext}
    >
      <CompactYearPicker
        value={selectedYear}
        onChange={(year) => patchDraft({ birthYear: year })}
      />
    </OnboardingShell>
  );
}
