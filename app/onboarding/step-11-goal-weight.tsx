import { useMemo, useState } from 'react';

import { NumericMeasurementInput, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { parsePositiveNumber } from '@/onboarding/helpers';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { kgToLb, lbToKg } from '@/utils/units';

const MIN_GOAL_WEIGHT_KG = 35;
const MAX_GOAL_WEIGHT_KG = 250;

export default function Step11GoalWeight() {
  const { step, goNext, goBack } = useOnboardingNavigation(10);
  const goalWeightKg = useOnboardingStore((state) => state.draft.goalWeightKg);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);
  const units = usePreferencesStore((state) => state.preferences.units);
  const setUnits = usePreferencesStore((state) => state.setUnits);

  const initialDisplay = useMemo(() => {
    if (!goalWeightKg) {
      return '';
    }
    return units.weight === 'kg' ? String(goalWeightKg) : String(kgToLb(goalWeightKg));
  }, [goalWeightKg, units.weight]);

  const [displayValue, setDisplayValue] = useState(initialDisplay);

  const persistWeight = (value: string) => {
    setDisplayValue(value);
    const parsed = parsePositiveNumber(value);
    if (!parsed) {
      patchDraft({ goalWeightKg: null });
      return;
    }

    const kg = units.weight === 'kg' ? parsed : lbToKg(parsed);
    patchDraft({ goalWeightKg: kg });
  };

  const toggleUnit = () => {
    const nextUnit = units.weight === 'kg' ? 'lb' : 'kg';
    setUnits({ ...units, weight: nextUnit });

    if (goalWeightKg) {
      setDisplayValue(nextUnit === 'kg' ? String(goalWeightKg) : String(kgToLb(goalWeightKg)));
    }
  };

  return (
    <OnboardingShell
      step={step}
      title="Goal weight"
      subtitle="Used to estimate your timeline and weekly milestones."
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!goalWeightKg || goalWeightKg < MIN_GOAL_WEIGHT_KG || goalWeightKg > MAX_GOAL_WEIGHT_KG}
      nextDisabledReason={`Enter a goal weight between ${MIN_GOAL_WEIGHT_KG} and ${MAX_GOAL_WEIGHT_KG} kg.`}
    >
      <NumericMeasurementInput
        label="Goal weight"
        value={displayValue}
        onChangeValue={persistWeight}
        unitLabel={units.weight.toUpperCase()}
        onToggleUnit={toggleUnit}
        placeholder={units.weight === 'kg' ? '62' : '137'}
      />
    </OnboardingShell>
  );
}
