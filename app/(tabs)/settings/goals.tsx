import { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { NumericMeasurementInput, OptionCard, PaceIntensityPicker } from '@/components/onboarding';
import { SettingsScreenShell } from '@/components/settings';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useSettingsProfile } from '@/hooks/useSettingsProfile';
import { FITNESS_GOAL_OPTIONS, TRAJECTORY_OPTIONS } from '@/onboarding/constants';
import { parsePositiveNumber } from '@/onboarding/helpers';
import { usePreferencesStore } from '@/stores/preferencesStore';
import type { Profile } from '@/types/profile';
import { colors, spacing } from '@/theme';
import { kgToLb, lbToKg } from '@/utils/units';

export default function GoalsSettingsScreen() {
  const { profile, isLoading, isSaving, error, saveAndRecalibrate } = useSettingsProfile();
  const units = usePreferencesStore((state) => state.preferences.units);
  const setUnits = usePreferencesStore((state) => state.setUnits);
  const [draft, setDraft] = useState<Profile | null>(null);

  useEffect(() => {
    if (profile) {
      setDraft(profile);
    }
  }, [profile]);

  const goalWeightDisplay = useMemo(() => {
    if (!draft) return '';
    return units.weight === 'kg' ? String(draft.goalWeightKg) : String(kgToLb(draft.goalWeightKg));
  }, [draft, units.weight]);

  if (isLoading || !draft) {
    return (
      <SettingsScreenShell title="Goals" subtitle="Loading...">
        <Text variant="bodyMuted">Loading goals...</Text>
      </SettingsScreenShell>
    );
  }

  const patch = (patchValue: Partial<Profile>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  };

  const hasUnsavedChanges =
    profile !== null && JSON.stringify(draft) !== JSON.stringify(profile);

  return (
    <SettingsScreenShell
      title="Goals"
      subtitle="Shape your direction and pace."
      hasUnsavedChanges={hasUnsavedChanges}
    >
      <NumericMeasurementInput
        label="Goal weight"
        value={goalWeightDisplay}
        onChangeValue={(value) => {
          const parsed = parsePositiveNumber(value);
          if (!parsed) return;
          patch({ goalWeightKg: units.weight === 'kg' ? parsed : lbToKg(parsed) });
        }}
        unitLabel={units.weight.toUpperCase()}
        onToggleUnit={() => setUnits({ ...units, weight: units.weight === 'kg' ? 'lb' : 'kg' })}
      />

      <Text variant="label" style={styles.section}>Fitness goal</Text>
      {FITNESS_GOAL_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          selected={draft.fitnessGoal === option.value}
          onPress={() => patch({ fitnessGoal: option.value })}
        />
      ))}

      <Text variant="label" style={styles.section}>Weight trajectory</Text>
      {TRAJECTORY_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          description={option.description}
          selected={draft.weightTrajectory === option.value}
          onPress={() => patch({ weightTrajectory: option.value })}
        />
      ))}

      <Text variant="label" style={styles.section}>Pace intensity</Text>
      <PaceIntensityPicker
        value={draft.paceKgPerWeek}
        onChange={(pace) => patch({ paceKgPerWeek: pace })}
      />

      {error ? <Text variant="body" style={styles.error}>{error}</Text> : null}
      <Button label={isSaving ? 'Saving...' : 'Save & update plan'} onPress={() => void saveAndRecalibrate(draft)} disabled={isSaving} />
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xs,
  },
  error: {
    color: colors.brandPrimary,
  },
});
