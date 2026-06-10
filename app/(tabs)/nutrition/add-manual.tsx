import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealFormField } from '@/components/nutrition/MealFormField';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { saveMeal } from '@/db/repositories/nutritionRepository';
import { parseMealNumber, validateMealInput } from '@/engines/nutrition';
import { MEAL_PRESETS, type MealPreset, type MealSource } from '@/types/nutrition';
import { colors, radius, spacing } from '@/theme';

export default function AddManualMealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mealDate: string; prefilledTitle?: string }>();
  const mealDate = params.mealDate ?? new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState(params.prefilledTitle ?? '');
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbsG, setCarbsG] = useState('');
  const [fatG, setFatG] = useState('');
  const [fiberG, setFiberG] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const applyPreset = (preset: MealPreset) => {
    setTitle(preset);
  };

  const handleSave = async () => {
    const input = {
      title,
      calories: parseMealNumber(calories) ?? Number.NaN,
      proteinG: parseMealNumber(proteinG) ?? Number.NaN,
      carbsG: parseMealNumber(carbsG) ?? Number.NaN,
      fatG: parseMealNumber(fatG) ?? Number.NaN,
      fiberG: parseMealNumber(fiberG) ?? Number.NaN,
      source: 'manual' as MealSource,
      mealDate,
    };

    const validation = validateMealInput(input);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSaving(true);
    setErrors([]);

    try {
      await saveMeal(input);
      router.back();
    } catch (saveError) {
      setErrors([
        saveError instanceof Error ? saveError.message : 'Could not save meal.',
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="h1">Quick Add</Text>
        <Text variant="bodyMuted">Enter macros manually when you already know them.</Text>

        <View style={styles.presets}>
          {MEAL_PRESETS.map((preset) => (
            <Pressable
              key={preset}
              accessibilityRole="button"
              onPress={() => applyPreset(preset)}
              style={[styles.presetChip, title === preset && styles.presetChipSelected]}
            >
              <Text variant="body" style={title === preset ? styles.presetTextSelected : undefined}>
                {preset}
              </Text>
            </Pressable>
          ))}
        </View>

        <MealFormField label="Meal name" value={title} onChangeText={setTitle} placeholder="Breakfast bowl" />
        <MealFormField
          label="Calories"
          value={calories}
          onChangeText={setCalories}
          keyboardType="decimal-pad"
          placeholder="420"
        />
        <MealFormField
          label="Protein (g)"
          value={proteinG}
          onChangeText={setProteinG}
          keyboardType="decimal-pad"
          placeholder="32"
        />
        <MealFormField
          label="Carbs (g)"
          value={carbsG}
          onChangeText={setCarbsG}
          keyboardType="decimal-pad"
          placeholder="40"
        />
        <MealFormField
          label="Fat (g)"
          value={fatG}
          onChangeText={setFatG}
          keyboardType="decimal-pad"
          placeholder="12"
        />
        <MealFormField
          label="Fiber (g)"
          value={fiberG}
          onChangeText={setFiberG}
          keyboardType="decimal-pad"
          placeholder="8"
        />

        {errors.length > 0 ? (
          <View style={styles.errorBox}>
            {errors.map((message) => (
              <Text key={message} variant="body" style={styles.errorText}>
                {message}
              </Text>
            ))}
          </View>
        ) : null}

        <Button label={isSaving ? 'Saving...' : 'Save Meal'} onPress={() => void handleSave()} disabled={isSaving} />
        <Button label="Cancel" variant="secondary" onPress={() => router.back()} />
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
    paddingBottom: spacing.lg,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  presetChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  presetChipSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: '#FFF8F7',
  },
  presetTextSelected: {
    color: colors.brandPrimary,
  },
  errorBox: {
    backgroundColor: '#FFF4EC',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.accentWarm,
    padding: spacing.sm,
    gap: 4,
  },
  errorText: {
    color: colors.textDark,
  },
});
