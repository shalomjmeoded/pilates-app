import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealFormField } from '@/components/nutrition/MealFormField';
import { SubscreenTopBar } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { getWeightLogById, saveWeightLog, updateWeightLog } from '@/db/repositories/weightLogRepository';
import { parseWeightInput, validateWeightKg } from '@/engines/progress';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { colors, radius, spacing } from '@/theme';
import { kgToLb, lbToKg } from '@/utils/units';

const NOTE_EXAMPLES = ['Vacation', 'Started new routine', 'Feeling stronger'];

export default function LogWeightModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string }>();
  const isEditing = Boolean(params.editId);
  const units = usePreferencesStore((state) => state.preferences.units);
  const setUnits = usePreferencesStore((state) => state.setUnits);

  const [weightValue, setWeightValue] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(null);

  useEffect(() => {
    if (!params.editId) return;
    void (async () => {
      const log = await getWeightLogById(params.editId!);
      if (!log) return;
      setWeightValue(
        units.weight === 'kg' ? String(log.weightKg) : String(kgToLb(log.weightKg)),
      );
      setNote(log.note ?? '');
      setInitialSnapshot(
        JSON.stringify({
          weight: units.weight === 'kg' ? String(log.weightKg) : String(kgToLb(log.weightKg)),
          note: log.note ?? '',
        }),
      );
    })();
  }, [params.editId, units.weight]);

  const toggleUnit = () => {
    const nextUnit = units.weight === 'kg' ? 'lb' : 'kg';
    setUnits({ ...units, weight: nextUnit });

    const parsed = parseWeightInput(weightValue);
    if (parsed !== null) {
      const kg = units.weight === 'kg' ? parsed : lbToKg(parsed);
      setWeightValue(nextUnit === 'kg' ? String(kg) : String(kgToLb(kg)));
    }
  };

  const applyNoteExample = (example: string) => {
    setNote(example);
  };

  const handleSave = async () => {
    const parsed = parseWeightInput(weightValue);
    if (parsed === null) {
      setErrors(['Enter a valid weight.']);
      return;
    }

    const weightKg = units.weight === 'kg' ? parsed : lbToKg(parsed);
    const validation = validateWeightKg(weightKg);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSaving(true);
    setErrors([]);

    try {
      if (isEditing && params.editId) {
        await updateWeightLog(params.editId, { weightKg, note: note.trim() || undefined });
      } else {
        await saveWeightLog({ weightKg, note: note.trim() || undefined });
      }
      router.back();
    } catch (saveError) {
      setErrors([saveError instanceof Error ? saveError.message : 'Could not save weight.']);
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges =
    initialSnapshot !== null
      ? initialSnapshot !== JSON.stringify({ weight: weightValue, note })
      : weightValue.length > 0 || note.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar hasUnsavedChanges={hasUnsavedChanges} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="h1">{isEditing ? 'Edit Weight' : 'Log Weight'}</Text>
        <Text variant="bodyMuted">Track how you are feeling over time.</Text>

        <View style={styles.weightRow}>
          <View style={styles.weightField}>
            <MealFormField
              label="Weight"
              value={weightValue}
              onChangeText={setWeightValue}
              keyboardType="decimal-pad"
              placeholder="0.0"
            />
          </View>
          <Pressable accessibilityRole="button" onPress={toggleUnit} style={styles.unitToggle}>
            <Text variant="label">{units.weight.toUpperCase()}</Text>
          </Pressable>
        </View>

        <MealFormField
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="How are you feeling?"
        />

        <View style={styles.examples}>
          {NOTE_EXAMPLES.map((example) => (
            <Pressable
              key={example}
              accessibilityRole="button"
              onPress={() => applyNoteExample(example)}
              style={styles.exampleChip}
            >
              <Text variant="bodyMuted">{example}</Text>
            </Pressable>
          ))}
        </View>

        {errors.map((error) => (
          <Text key={error} variant="body" style={styles.error}>
            {error}
          </Text>
        ))}

        <View style={styles.actions}>
          <Button label={isSaving ? 'Saving...' : 'Save'} onPress={handleSave} disabled={isSaving} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  weightField: {
    flex: 1,
  },
  unitToggle: {
    minWidth: 56,
    minHeight: 48,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  examples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  exampleChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
  },
  error: {
    color: colors.brandPrimary,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
