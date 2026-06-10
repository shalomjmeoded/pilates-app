import { useEffect } from 'react';

import { OnboardingShell, VerticalMeasurementRuler } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';

const DEFAULT_HEIGHT_CM = 168;

export default function Step06Height() {
  const { step, goNext, goBack } = useOnboardingNavigation(7);
  const heightCm = useOnboardingStore((state) => state.draft.heightCm);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);
  const units = usePreferencesStore((state) => state.preferences.units);
  const setUnits = usePreferencesStore((state) => state.setUnits);

  useEffect(() => {
    if (!heightCm) {
      patchDraft({ heightCm: DEFAULT_HEIGHT_CM });
    }
  }, [heightCm, patchDraft]);

  const valueCm = heightCm ?? DEFAULT_HEIGHT_CM;

  return (
    <OnboardingShell
      step={step}
      title="Your height"
      subtitle="Scroll the ruler to match you — like Apple Health."
      onBack={goBack}
      onNext={goNext}
      nextDisabled={valueCm < 120 || valueCm > 230}
      scrollEnabled={false}
    >
      <VerticalMeasurementRuler
        valueCm={valueCm}
        unit={units.height}
        onChangeCm={(cm) => patchDraft({ heightCm: cm })}
        onToggleUnit={() =>
          setUnits({ ...units, height: units.height === 'cm' ? 'in' : 'cm' })
        }
      />
    </OnboardingShell>
  );
}
