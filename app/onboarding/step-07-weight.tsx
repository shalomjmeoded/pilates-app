import { useEffect } from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { HorizontalMeasurementRuler, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { kgToLb } from '@/utils/units';

const DEFAULT_WEIGHT_KG = 68;

export default function Step07Weight() {
  const { step, goNext, goBack } = useOnboardingNavigation(6);
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
  const displayWeight = units.weight === 'kg' ? valueKg.toFixed(1) : String(kgToLb(valueKg));

  return (
    <OnboardingShell
      step={step}
      title="Your current weight"
      subtitle="Adjust the scale to match."
      heroImageSource={require('../../assets/onboarding/hero-body.png')}
      heroAccessibilityLabel="Pilates teaser pose"
      insightText={`Locked in: ${displayWeight} ${units.weight}`}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={valueKg < 35 || valueKg > 250}
    >
      <Animated.View entering={FadeInUp.delay(80).duration(280)}>
        <HorizontalMeasurementRuler
          valueKg={valueKg}
          unit={units.weight}
          onChangeKg={(kg) => patchDraft({ currentWeightKg: kg })}
          onToggleUnit={() =>
            setUnits({ ...units, weight: units.weight === 'kg' ? 'lb' : 'kg' })
          }
        />
      </Animated.View>
    </OnboardingShell>
  );
}
