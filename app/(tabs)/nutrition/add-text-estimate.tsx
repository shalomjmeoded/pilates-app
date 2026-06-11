import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { MEAL_TEXT_ESTIMATE_COPY } from '@/engines/nutrition/mealTextEstimateFlow';
import { useMealTextEstimate } from '@/hooks/useMealTextEstimate';
import { colors, radius, spacing } from '@/theme';

export default function AddTextEstimateScreen() {
  const params = useLocalSearchParams<{ mealDate: string }>();
  const mealDate = params.mealDate ?? new Date().toISOString().slice(0, 10);

  const {
    description,
    setDescription,
    error,
    isEstimating,
    estimate,
    openManualFallback,
  } = useMealTextEstimate(mealDate);
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + spacing.lg;

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar hasUnsavedChanges={description.trim().length > 0} />
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: bottomPadding }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="h1">Text Estimate</Text>
        <Text variant="bodyMuted">{MEAL_TEXT_ESTIMATE_COPY}</Text>

        <Card style={styles.card}>
          <Text variant="label">Meal description</Text>
          <TextInput
            accessibilityLabel="Meal description"
            multiline
            placeholder="Grilled salmon, quinoa, roasted broccoli, olive oil"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={description}
            onChangeText={setDescription}
          />
        </Card>

        {error ? (
          <Text variant="body" style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <Button
          label={isEstimating ? 'Estimating...' : 'Estimate Macros'}
          onPress={() => void estimate()}
          disabled={isEstimating}
        />
        <Button
          label="Enter Manually Instead"
          variant="secondary"
          onPress={openManualFallback}
          disabled={isEstimating}
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
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    padding: spacing.sm,
    color: colors.textDark,
    textAlignVertical: 'top',
    backgroundColor: colors.surfaceCanvas,
  },
  errorText: {
    color: colors.brandPrimary,
  },
});
