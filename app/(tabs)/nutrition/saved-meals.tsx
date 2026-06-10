import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PremiumGate } from '@/components/premium';
import { MealFormField } from '@/components/nutrition/MealFormField';
import { SubscreenTopBar } from '@/components/navigation';
import { usePremium } from '@/hooks/usePremium';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { saveMeal } from '@/db/repositories/nutritionRepository';
import { deleteSavedMeal, getSavedMeals, saveSavedMeal } from '@/db/repositories/savedMealRepository';
import { parseMealNumber, validateMealInput } from '@/engines/nutrition';
import type { SavedMeal } from '@/types/nutrition';
import { colors, radius, spacing } from '@/theme';

export default function SavedMealsScreen() {
  const router = useRouter();
  const { hasAccess } = usePremium();
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [title, setTitle] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbsG, setCarbsG] = useState('');
  const [fatG, setFatG] = useState('');
  const [fiberG, setFiberG] = useState('');

  const reload = useCallback(async () => {
    setSavedMeals(await getSavedMeals());
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const hasUnsavedChanges =
    title.length > 0 ||
    calories.length > 0 ||
    proteinG.length > 0 ||
    carbsG.length > 0 ||
    fatG.length > 0 ||
    fiberG.length > 0;

  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <SubscreenTopBar />
        <PremiumGate description="Save meals you eat often and log them with one tap." />
      </SafeAreaView>
    );
  }

  const handleSaveTemplate = async () => {
    const input = {
      title,
      calories: parseMealNumber(calories) ?? Number.NaN,
      proteinG: parseMealNumber(proteinG) ?? Number.NaN,
      carbsG: parseMealNumber(carbsG) ?? Number.NaN,
      fatG: parseMealNumber(fatG) ?? Number.NaN,
      fiberG: parseMealNumber(fiberG) ?? Number.NaN,
    };
    const validation = validateMealInput({ ...input, source: 'manual', mealDate: '2000-01-01' });
    if (!validation.valid) return;

    await saveSavedMeal(input);
    setTitle('');
    setCalories('');
    setProteinG('');
    setCarbsG('');
    setFatG('');
    setFiberG('');
    await reload();
  };

  const logTemplate = async (template: SavedMeal) => {
    const today = new Date().toISOString().slice(0, 10);
    await saveMeal({
      title: template.title,
      calories: template.calories,
      proteinG: template.proteinG,
      carbsG: template.carbsG,
      fatG: template.fatG,
      fiberG: template.fiberG,
      source: 'manual',
      mealDate: today,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar hasUnsavedChanges={hasUnsavedChanges} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="h1">Saved Meals</Text>
        <Text variant="bodyMuted">Templates for faster logging.</Text>

        {savedMeals.map((meal) => (
          <View key={meal.id} style={styles.templateCard}>
            <Text variant="h2">{meal.title}</Text>
            <Text variant="bodyMuted">{Math.round(meal.calories)} kcal</Text>
            <View style={styles.row}>
              <Button label="Log today" onPress={() => void logTemplate(meal)} />
              <Pressable accessibilityRole="button" onPress={() => void deleteSavedMeal(meal.id).then(reload)} style={styles.delete}>
                <Text variant="label" style={styles.deleteText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <Text variant="h2">New template</Text>
        <MealFormField label="Name" value={title} onChangeText={setTitle} />
        <MealFormField label="Calories" value={calories} onChangeText={setCalories} keyboardType="decimal-pad" />
        <MealFormField label="Protein (g)" value={proteinG} onChangeText={setProteinG} keyboardType="decimal-pad" />
        <MealFormField label="Carbs (g)" value={carbsG} onChangeText={setCarbsG} keyboardType="decimal-pad" />
        <MealFormField label="Fat (g)" value={fatG} onChangeText={setFatG} keyboardType="decimal-pad" />
        <MealFormField label="Fiber (g)" value={fiberG} onChangeText={setFiberG} keyboardType="decimal-pad" />
        <Button label="Save template" onPress={() => void handleSaveTemplate()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundPrimary },
  container: { padding: spacing.sm, gap: spacing.sm },
  templateCard: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  delete: { minHeight: 44, justifyContent: 'center' },
  deleteText: { color: colors.brandPrimary },
});
