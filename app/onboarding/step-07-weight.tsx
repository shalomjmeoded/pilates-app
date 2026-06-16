import { useEffect } from 'react';
import { HorizontalMeasurementRuler, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';

const DEFAULT_WEIGHT_KG = 68;

export default function Step07Weight() {
  const { step, goNext, goBack } = useOnboardingNavigation(7);
  const currentWeightKg = useOnboardingStore((state) => state.draft.currentWeightKg);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);
  const units = usePreferencesStore((state) => state.preferences.units);
  const setUnits = usePreferencesStore((state) => state.setUnits);

  useEffect(() => {
    if (!currentWeightKg) {
      patchDraft({ currentWeightKg: DEFAULT_WEIGHT_KG });
    }
  }, [currentWeightKg, patchDraft]);

  const valueKg = currentWeightKg ?? DEFAULT_WEIGHT_KG;
  return (
    <OnboardingShell
      step={step}
      title="Your current weight"
      subtitle="Adjust the scale to match."
      onBack={goBack}
      onNext={goNext}
      nextDisabled={valueKg < 35 || valueKg > 250}
    >
      <HorizontalMeasurementRuler
        valueKg={valueKg}
        unit={units.weight}
        onChangeKg={(kg) => patchDraft({ currentWeightKg: kg })}
        onToggleUnit={() =>
          setUnits({ ...units, weight: units.weight === 'kg' ? 'lb' : 'kg' })
        }
      />
    </OnboardingShell>
  );
}
