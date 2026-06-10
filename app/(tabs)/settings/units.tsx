import { SettingsScreenShell, SettingsToggleRow } from '@/components/settings';
import { Text } from '@/components/ui/Text';
import { logSettingChange } from '@/db/repositories/settingsAuditRepository';
import { usePreferencesStore } from '@/stores/preferencesStore';

export default function UnitsSettingsScreen() {
  const units = usePreferencesStore((state) => state.preferences.units);
  const setUnits = usePreferencesStore((state) => state.setUnits);

  const toggleHeight = async () => {
    const next = units.height === 'cm' ? 'in' : 'cm';
    await logSettingChange('units.height', units.height, next);
    setUnits({ ...units, height: next });
  };

  const toggleWeight = async () => {
    const next = units.weight === 'kg' ? 'lb' : 'kg';
    await logSettingChange('units.weight', units.weight, next);
    setUnits({ ...units, weight: next });
  };

  return (
    <SettingsScreenShell
      title="Units"
      subtitle="Display units only — your data stays stored in cm and kg."
    >
      <SettingsToggleRow
        label="Height in centimeters"
        description={units.height === 'cm' ? 'Showing cm' : 'Showing inches'}
        enabled={units.height === 'cm'}
        onToggle={() => void toggleHeight()}
      />
      <SettingsToggleRow
        label="Weight in kilograms"
        description={units.weight === 'kg' ? 'Showing kg' : 'Showing lb'}
        enabled={units.weight === 'kg'}
        onToggle={() => void toggleWeight()}
      />
      <Text variant="bodyMuted">
        Workout, Nutrition, Progress, and Settings update instantly when you switch units.
      </Text>
    </SettingsScreenShell>
  );
}
