import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { usePreferencesStore } from '@/stores/preferencesStore';
import type { UnitPreferences } from '@/types/preferences';

function isMetricUnits(units: UnitPreferences): boolean {
  return units.height === 'cm' && units.weight === 'kg';
}

export default function Step00Units() {
  const { step, goNext } = useOnboardingNavigation(1);
  const units = usePreferencesStore((state) => state.preferences.units);
  const setUnits = usePreferencesStore((state) => state.setUnits);

  const applySystem = (metric: boolean) => {
    setUnits(metric ? { height: 'cm', weight: 'kg' } : { height: 'in', weight: 'lb' });
  };

  return (
    <OnboardingShell
      step={step}
      title="Choose your measurement system"
      subtitle="Height and weight will use these units throughout Tune. You can change this later in Settings."
      showBack={false}
      onNext={goNext}
    >
      <OptionCard
        label="Metric"
        description="Centimeters and kilograms"
        selected={isMetricUnits(units)}
        onPress={() => applySystem(true)}
      />
      <OptionCard
        label="Imperial"
        description="Inches and pounds"
        selected={!isMetricUnits(units)}
        onPress={() => applySystem(false)}
      />
    </OnboardingShell>
  );
}
