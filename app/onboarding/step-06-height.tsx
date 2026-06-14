import { useEffect } from 'react';

import { OnboardingShell, VerticalMeasurementRuler } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';

const DEFAULT_HEIGHT_CM = 168;

export default function Step06Height() {
  const { step, goNext, goBack } = useOnboardingNavigation(5);
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
  const isMetric = units.height === 'cm' && units.weight === 'kg';
  const applyUnitSystem = (metric: boolean) => {
    setUnits(metric ? { height: 'cm', weight: 'kg' } : { height: 'in', weight: 'lb' });
  };

  return (
    <OnboardingShell
      step={step}
      title="Let's measure your height"
      subtitle="Scroll the ruler to match you — smooth, precise, and private on your device."
      onBack={goBack}
      onNext={goNext}
      nextDisabled={valueCm < 120 || valueCm > 230}
      titleLines={2}
    >
      <VerticalMeasurementRuler
        valueCm={valueCm}
        unit={units.height}
        onChangeCm={(cm) => patchDraft({ heightCm: cm })}
        selectedSystem={isMetric ? 'metric' : 'imperial'}
        onSelectSystem={applyUnitSystem}
      />
    </OnboardingShell>
  );
}
