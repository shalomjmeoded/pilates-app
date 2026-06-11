import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { MEAL_TEXT_ESTIMATE_COPY } from '@/engines/nutrition/mealTextEstimateFlow';
import { usePremium } from '@/hooks/usePremium';
import { colors, spacing } from '@/theme';

export default function AddMealHubScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mealDate: string }>();
  const mealDate = params.mealDate ?? new Date().toISOString().slice(0, 10);
  const { requirePremium } = usePremium();
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + spacing.lg;

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar />
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: bottomPadding }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="h1">Add Meal</Text>
        <Text variant="bodyMuted">Choose how you want to log this meal.</Text>

        <Card style={styles.card}>
          <Text variant="label">Recommended</Text>
          <Text variant="h2">Text Estimate</Text>
          <Text variant="bodyMuted">{MEAL_TEXT_ESTIMATE_COPY}</Text>
          <Button
            label="Estimate from Text"
            onPress={() =>
              requirePremium('ai_meal_text', () =>
                router.push({
                  pathname: '/(tabs)/nutrition/add-text-estimate',
                  params: { mealDate },
                }),
              )
            }
          />
        </Card>

        <Card style={styles.card}>
          <Text variant="h2">Quick Add</Text>
          <Text variant="bodyMuted">Enter macros manually when you already know them.</Text>
          <Button
            label="Quick Add"
            variant="secondary"
            onPress={() =>
              requirePremium('add_meal', () =>
                router.push({
                  pathname: '/(tabs)/nutrition/add-manual',
                  params: { mealDate },
                }),
              )
            }
          />
        </Card>

        <Card style={styles.card}>
          <Text variant="h2">Photo Estimate</Text>
          <Text variant="bodyMuted">
            Photo estimates are best for simple visible meals.
          </Text>
          <Button
            label="Estimate from Photo"
            variant="secondary"
            onPress={() =>
              requirePremium('ai_meal_photo', () =>
                router.push({
                  pathname: '/(tabs)/nutrition/add-photo-estimate',
                  params: { mealDate },
                }),
              )
            }
          />
        </Card>

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
});
