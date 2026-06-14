import { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { NumericMeasurementInput, OptionCard } from '@/components/onboarding';
import { MealFormField } from '@/components/nutrition/MealFormField';
import { SettingsScreenShell } from '@/components/settings';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useSettingsProfile } from '@/hooks/useSettingsProfile';
import {
  FREQUENCY_OPTIONS,
  GENDER_OPTIONS,
  PREFERENCE_OPTIONS,
} from '@/onboarding/constants';
import { usePreferencesStore } from '@/stores/preferencesStore';
import type { ExercisePreference, Profile } from '@/types/profile';
import { colors, spacing } from '@/theme';
import { kgToLb, lbToKg, cmToInches, inchesToCm } from '@/utils/units';
import { getBirthYearBounds, parsePositiveNumber } from '@/onboarding/helpers';

export default function ProfileSettingsScreen() {
  const { profile, isLoading, isSaving, error, saveAndRecalibrate } = useSettingsProfile();
  const units = usePreferencesStore((state) => state.preferences.units);
  const setUnits = usePreferencesStore((state) => state.setUnits);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [birthYear, setBirthYear] = useState('');
  const { minYear: minBirthYear, maxYear: maxBirthYear } = getBirthYearBounds();

  useEffect(() => {
    if (profile) {
      setDraft(profile);
      setBirthYear(String(profile.birthYear));
    }
  }, [profile]);

  const heightDisplay = useMemo(() => {
    if (!draft) return '';
    return units.height === 'cm' ? String(draft.heightCm) : String(cmToInches(draft.heightCm));
  }, [draft, units.height]);

  const weightDisplay = useMemo(() => {
    if (!draft) return '';
    return units.weight === 'kg' ? String(draft.currentWeightKg) : String(kgToLb(draft.currentWeightKg));
  }, [draft, units.weight]);

  if (isLoading || !draft) {
    return (
      <SettingsScreenShell title="Profile" subtitle="Loading...">
        <Text variant="bodyMuted">Loading profile...</Text>
      </SettingsScreenShell>
    );
  }

  const patch = (patchValue: Partial<Profile>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  };

  const togglePreference = (value: ExercisePreference) => {
    const next = draft.exercisePreferences.includes(value)
      ? draft.exercisePreferences.filter((item) => item !== value)
      : [...draft.exercisePreferences, value];
    patch({ exercisePreferences: next });
  };

  const handleSave = () => {
    const year = Number(birthYear);
    if (!Number.isFinite(year) || year < minBirthYear || year > maxBirthYear) {
      return;
    }
    void saveAndRecalibrate({ ...draft, birthYear: year });
  };

  const hasUnsavedChanges =
    profile !== null &&
    (JSON.stringify(draft) !== JSON.stringify(profile) || birthYear !== String(profile.birthYear));

  return (
    <SettingsScreenShell
      title="Profile"
      subtitle="Body details and movement preferences."
      hasUnsavedChanges={hasUnsavedChanges}
    >
      <Text variant="label">Gender</Text>
      {GENDER_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          selected={draft.genderIdentity === option.value}
          onPress={() => patch({ genderIdentity: option.value })}
        />
      ))}

      <MealFormField
        label="Birth year"
        value={birthYear}
        onChangeText={setBirthYear}
        keyboardType="decimal-pad"
        placeholder="1990"
      />

      <NumericMeasurementInput
        label="Height"
        value={heightDisplay}
        onChangeValue={(value) => {
          const parsed = parsePositiveNumber(value);
          if (!parsed) return;
          patch({ heightCm: units.height === 'cm' ? parsed : inchesToCm(parsed) });
        }}
        unitLabel={units.height.toUpperCase()}
        onToggleUnit={() => setUnits({ ...units, height: units.height === 'cm' ? 'in' : 'cm' })}
      />

      <NumericMeasurementInput
        label="Current weight"
        value={weightDisplay}
        onChangeValue={(value) => {
          const parsed = parsePositiveNumber(value);
          if (!parsed) return;
          patch({ currentWeightKg: units.weight === 'kg' ? parsed : lbToKg(parsed) });
        }}
        unitLabel={units.weight.toUpperCase()}
        onToggleUnit={() => setUnits({ ...units, weight: units.weight === 'kg' ? 'lb' : 'kg' })}
      />

      <Text variant="label" style={styles.section}>Training frequency</Text>
      {FREQUENCY_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          selected={draft.trainingFrequency === option.value}
          onPress={() => patch({ trainingFrequency: option.value })}
        />
      ))}

      <Text variant="label" style={styles.section}>Exercise preferences</Text>
      <OptionCard
        label="No preference"
        description="Keep my workouts balanced."
        selected={draft.exercisePreferences.length === 0}
        onPress={() => patch({ exercisePreferences: [] })}
      />
      {PREFERENCE_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          selectionMode="multiple"
          selected={draft.exercisePreferences.includes(option.value)}
          onPress={() => togglePreference(option.value)}
        />
      ))}

      {error ? <Text variant="body" style={styles.error}>{error}</Text> : null}
      <Button label={isSaving ? 'Saving...' : 'Save & update plan'} onPress={handleSave} disabled={isSaving} />
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
