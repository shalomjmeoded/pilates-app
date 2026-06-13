import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealFormField } from '@/components/nutrition/MealFormField';
import { SubscreenTopBar } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useSaveReviewedAiMeal } from '@/hooks/useSaveReviewedAiMeal';
import { useAiMealReviewStore } from '@/stores/aiMealReviewStore';
import { colors, metrics, radius, spacing } from '@/theme';

export default function ReviewAiMealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mealDate: string }>();
  const mealDate = params.mealDate ?? new Date().toISOString().slice(0, 10);
  const { estimate, clear, source } = useAiMealReviewStore();

  const [title, setTitle] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbsG, setCarbsG] = useState('');
  const [fatG, setFatG] = useState('');
  const [fiberG, setFiberG] = useState('');
  const [saveToLibrary, setSaveToLibrary] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + spacing.lg;

  const { save, errors, isSaving, parseField } = useSaveReviewedAiMeal(mealDate, estimate);

  useEffect(() => {
    if (!estimate) {
      router.replace({
        pathname:
          source === 'ai_photo'
            ? '/(tabs)/nutrition/add-photo-estimate'
            : '/(tabs)/nutrition/add-text-estimate',
        params: { mealDate },
      });
      return;
    }

    const snapshot = {
      title: estimate.mealTitle,
      calories: String(estimate.calories),
      proteinG: String(estimate.proteinG),
      carbsG: String(estimate.carbsG),
      fatG: String(estimate.fatG),
      fiberG: String(estimate.fiberG),
      saveToLibrary: false,
    };
    setTitle(snapshot.title);
    setCalories(snapshot.calories);
    setProteinG(snapshot.proteinG);
    setCarbsG(snapshot.carbsG);
    setFatG(snapshot.fatG);
    setFiberG(snapshot.fiberG);
    setSaveToLibrary(false);
    setInitialSnapshot(JSON.stringify(snapshot));
  }, [estimate, mealDate, router, source]);

  if (!estimate) {
    return null;
  }

  const currentSnapshot = JSON.stringify({
    title,
    calories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    saveToLibrary,
  });
  const hasUnsavedChanges =
    initialSnapshot !== null && currentSnapshot !== initialSnapshot;

  const handleBack = () => {
    clear();
    router.back();
  };

  const handleSave = () => {
    void save(
      {
        title,
        calories: parseField(calories) ?? Number.NaN,
        proteinG: parseField(proteinG) ?? Number.NaN,
        carbsG: parseField(carbsG) ?? Number.NaN,
        fatG: parseField(fatG) ?? Number.NaN,
        fiberG: parseField(fiberG) ?? Number.NaN,
      },
      saveToLibrary,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar hasUnsavedChanges={hasUnsavedChanges} onPress={handleBack} />
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: bottomPadding }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="h1">Review Estimate</Text>
        <Text variant="bodyMuted">
          AI estimate — adjust if needed. Tune never auto-saves AI results.
        </Text>

        <Card style={styles.card}>
          <Text variant="label">AI confidence</Text>
          <Text variant="body">{Math.round(estimate.confidence * 100)}%</Text>
          {estimate.ingredients.length > 0 ? (
            <View style={styles.ingredients}>
              <Text variant="label">Ingredients</Text>
              {estimate.ingredients.map((item) => (
                <Text key={`${item.name}-${item.grams}`} variant="bodyMuted">
                  {item.name} · {item.grams}g
                </Text>
              ))}
            </View>
          ) : null}
        </Card>

        <MealFormField label="Meal name" value={title} onChangeText={setTitle} />
        <MealFormField
          label="Calories"
          value={calories}
          onChangeText={setCalories}
          keyboardType="decimal-pad"
        />
        <MealFormField
          label="Protein (g)"
          value={proteinG}
          onChangeText={setProteinG}
          keyboardType="decimal-pad"
        />
        <MealFormField
          label="Carbs (g)"
          value={carbsG}
          onChangeText={setCarbsG}
          keyboardType="decimal-pad"
        />
        <MealFormField label="Fat (g)" value={fatG} onChangeText={setFatG} keyboardType="decimal-pad" />
        <MealFormField
          label="Fiber (g)"
          value={fiberG}
          onChangeText={setFiberG}
          keyboardType="decimal-pad"
        />

        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel="Save this meal to saved meals"
          accessibilityHint="Adds the reviewed meal for quick reuse later"
          accessibilityState={{ checked: saveToLibrary }}
          onPress={() => setSaveToLibrary((value) => !value)}
          style={styles.checkboxRow}
        >
          <View style={[styles.checkbox, saveToLibrary && styles.checkboxChecked]} />
          <Text variant="body">Save to Saved Meals for quick reuse later</Text>
        </Pressable>

        {errors.length > 0 ? (
          <View style={styles.errorBox}>
            {errors.map((message) => (
              <Text key={message} variant="body" style={styles.errorText}>
                {message}
              </Text>
            ))}
          </View>
        ) : null}

        <Button
          label={isSaving ? 'Saving...' : 'Save Meal'}
          onPress={handleSave}
          disabled={isSaving}
        />
        <Button
          label="Discard"
          variant="secondary"
          onPress={() => {
            clear();
            router.back();
          }}
        />
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
  card: {
    gap: spacing.xs,
  },
  ingredients: {
    gap: 4,
    marginTop: spacing.xs,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: metrics.touchTargetMin,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.square,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
  },
  checkboxChecked: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
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
});
