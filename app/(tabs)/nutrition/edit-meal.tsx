import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';

import { MealFormField } from '@/components/nutrition/MealFormField';
import { SubscreenTopBar } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { deleteMeal, getMealById, updateMeal } from '@/db/repositories/nutritionRepository';
import { parseMealNumber, validateMealInput } from '@/engines/nutrition';
import { colors, spacing } from '@/theme';

function formSnapshot(fields: {
  title: string;
  calories: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
  fiberG: string;
  loggedAt: string;
}): string {
  return JSON.stringify(fields);
}

export default function EditMealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mealId: string }>();
  const [title, setTitle] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbsG, setCarbsG] = useState('');
  const [fatG, setFatG] = useState('');
  const [fiberG, setFiberG] = useState('');
  const [loggedAt, setLoggedAt] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + spacing.lg;

  useEffect(() => {
    void (async () => {
      const meal = await getMealById(params.mealId);
      if (!meal) return;
      const nextTitle = meal.title;
      const nextCalories = String(meal.calories);
      const nextProteinG = String(meal.proteinG);
      const nextCarbsG = String(meal.carbsG);
      const nextFatG = String(meal.fatG);
      const nextFiberG = String(meal.fiberG);
      const nextLoggedAt = format(parseISO(meal.loggedAt), "yyyy-MM-dd'T'HH:mm");
      setTitle(nextTitle);
      setCalories(nextCalories);
      setProteinG(nextProteinG);
      setCarbsG(nextCarbsG);
      setFatG(nextFatG);
      setFiberG(nextFiberG);
      setLoggedAt(nextLoggedAt);
      setInitialSnapshot(
        formSnapshot({
          title: nextTitle,
          calories: nextCalories,
          proteinG: nextProteinG,
          carbsG: nextCarbsG,
          fatG: nextFatG,
          fiberG: nextFiberG,
          loggedAt: nextLoggedAt,
        }),
      );
    })();
  }, [params.mealId]);

  const currentSnapshot = useMemo(
    () =>
      formSnapshot({
        title,
        calories,
        proteinG,
        carbsG,
        fatG,
        fiberG,
        loggedAt,
      }),
    [title, calories, proteinG, carbsG, fatG, fiberG, loggedAt],
  );

  const hasUnsavedChanges =
    initialSnapshot !== null && currentSnapshot !== initialSnapshot;

  const handleSave = async () => {
    const input = {
      title,
      calories: parseMealNumber(calories) ?? Number.NaN,
      proteinG: parseMealNumber(proteinG) ?? Number.NaN,
      carbsG: parseMealNumber(carbsG) ?? Number.NaN,
      fatG: parseMealNumber(fatG) ?? Number.NaN,
      fiberG: parseMealNumber(fiberG) ?? Number.NaN,
    };
    const validation = validateMealInput({ ...input, source: 'manual', mealDate: '2000-01-01' });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSaving(true);
    try {
      await updateMeal(params.mealId, {
        ...input,
        loggedAt: new Date(loggedAt).toISOString(),
      });
      router.back();
    } catch (saveError) {
      setErrors([saveError instanceof Error ? saveError.message : 'Could not save meal.']);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete meal?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await deleteMeal(params.mealId);
            router.back();
          })();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar hasUnsavedChanges={hasUnsavedChanges} />
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: bottomPadding }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="h1">Edit Meal</Text>
        <MealFormField label="Name" value={title} onChangeText={setTitle} />
        <MealFormField label="Calories" value={calories} onChangeText={setCalories} keyboardType="decimal-pad" />
        <MealFormField label="Protein (g)" value={proteinG} onChangeText={setProteinG} keyboardType="decimal-pad" />
        <MealFormField label="Carbs (g)" value={carbsG} onChangeText={setCarbsG} keyboardType="decimal-pad" />
        <MealFormField label="Fat (g)" value={fatG} onChangeText={setFatG} keyboardType="decimal-pad" />
        <MealFormField label="Fiber (g)" value={fiberG} onChangeText={setFiberG} keyboardType="decimal-pad" />
        <MealFormField label="Logged at (ISO local)" value={loggedAt} onChangeText={setLoggedAt} />
        {errors.map((error) => (
          <Text key={error} variant="body" style={styles.error}>
            {error}
          </Text>
        ))}
        <View style={styles.actions}>
          <Button label={isSaving ? 'Saving...' : 'Save'} onPress={() => void handleSave()} disabled={isSaving} />
          <Button label="Delete meal" variant="secondary" onPress={handleDelete} />
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
  actions: {
    gap: spacing.sm,
  },
  error: {
    color: colors.brandPrimary,
  },
});
