import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealFormField } from '@/components/nutrition/MealFormField';
import { SubscreenTopBar } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { saveMeal } from '@/db/repositories/nutritionRepository';
import {
  parseMealNumber,
  roundCaloriesFromMacros,
  validateMealInput,
} from '@/engines/nutrition';
import { useEncouragementStore } from '@/stores/encouragementStore';
import { MEAL_PRESETS, type MealPreset, type MealSource } from '@/types/nutrition';
import { colors, metrics, radius, spacing, createDynamicStyles } from '@/theme';
import { mealLoggedEncouragement } from '@/utils/encouragement';
import { successNotificationHaptic } from '@/utils/haptics';

export default function AddManualMealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mealDate: string; prefilledTitle?: string }>();
  const mealDate = params.mealDate ?? new Date().toISOString().slice(0, 10);
  const pushEncouragement = useEncouragementStore((state) => state.pushMessage);

  const [title, setTitle] = useState(params.prefilledTitle ?? '');
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbsG, setCarbsG] = useState('');
  const [fatG, setFatG] = useState('');
  const [fiberG, setFiberG] = useState('');
  const [caloriesManualOverride, setCaloriesManualOverride] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + spacing.lg;

  useEffect(() => {
    if (caloriesManualOverride) {
      return;
    }
    const protein = parseMealNumber(proteinG);
    const carbs = parseMealNumber(carbsG);
    const fat = parseMealNumber(fatG);
    if (protein === null && carbs === null && fat === null) {
      return;
    }
    const derived = roundCaloriesFromMacros(protein ?? 0, carbs ?? 0, fat ?? 0);
    setCalories(String(derived));
  }, [proteinG, carbsG, fatG, caloriesManualOverride]);

  const closeToNutrition = () => {
    router.dismissAll();
    router.replace({
      pathname: '/(tabs)/nutrition',
      params: { mealDate },
    });
  };

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
      const encouragement = mealLoggedEncouragement();
      pushEncouragement('nutrition', encouragement.title, encouragement.body);
      successNotificationHaptic();
      AccessibilityInfo.announceForAccessibility('Meal logged successfully.');
      closeToNutrition();
    } catch (saveError) {
      setErrors([
        saveError instanceof Error ? saveError.message : 'Could not save meal.',
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges =
    title.length > 0 ||
    calories.length > 0 ||
    proteinG.length > 0 ||
    carbsG.length > 0 ||
    fatG.length > 0 ||
    fiberG.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar hasUnsavedChanges={hasUnsavedChanges} onPress={closeToNutrition} />
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: bottomPadding }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="h1">Quick Add</Text>
        <Text variant="bodyMuted">
          Enter protein, carbs, and fat — calories update from the macro breakdown.
        </Text>

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
          label="Calories"
          value={calories}
          onChangeText={(value) => {
            setCaloriesManualOverride(true);
            setCalories(value);
          }}
          keyboardType="decimal-pad"
          placeholder="420"
        />
        <Text variant="caption" style={styles.hint}>
          {caloriesManualOverride
            ? 'Calories overridden — must stay within ~2% of P×4 + C×4 + F×9.'
            : 'Calories auto-calculated from macros (P×4 + C×4 + F×9).'}
        </Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = createDynamicStyles(() => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    padding: spacing.sm,
    gap: spacing.sm,
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
    minHeight: metrics.touchTargetMin,
    justifyContent: 'center',
  },
  presetChipSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surfaceSelected,
  },
  presetTextSelected: {
    color: colors.brandPrimary,
  },
  hint: {
    color: colors.textMuted,
    marginTop: -spacing.xs,
  },
  errorBox: {
    backgroundColor: colors.warningSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.sm,
    gap: 4,
  },
  errorText: {
    color: colors.textDark,
  },
}));
