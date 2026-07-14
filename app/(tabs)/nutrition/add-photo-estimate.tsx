import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import {
  MEAL_PHOTO_DESCRIPTION_HINT,
  MEAL_PHOTO_DESCRIPTION_PLACEHOLDER,
  MEAL_PHOTO_ESTIMATE_COPY,
} from '@/engines/nutrition/mealTextEstimateFlow';
import { useMealPhotoEstimate } from '@/hooks/useMealPhotoEstimate';
import { useDelayedLoadingMessage } from '@/hooks/useDelayedLoadingMessage';
import { colors, radius, spacing, createDynamicStyles } from '@/theme';

export default function AddPhotoEstimateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mealDate: string }>();
  const mealDate = params.mealDate ?? new Date().toISOString().slice(0, 10);

  const {
    previewUri,
    description,
    setDescription,
    error,
    showManualFallbackCta,
    isEstimating,
    selectPhoto,
    estimateSelectedPhoto,
    openManualFallback,
  } = useMealPhotoEstimate(mealDate);
  const loadingMessage = useDelayedLoadingMessage(isEstimating);
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + spacing.lg;
  const closeToNutrition = () => {
    router.dismissAll();
    router.replace({
      pathname: '/(tabs)/nutrition',
      params: { mealDate },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar
        hasUnsavedChanges={previewUri !== null || description.trim().length > 0}
        onPress={closeToNutrition}
      />
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: bottomPadding }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="h1">Photo Estimate</Text>
        <Text variant="bodyMuted">{MEAL_PHOTO_ESTIMATE_COPY}</Text>

        {previewUri ? (
          <Image
            accessibilityLabel="Selected meal photo preview"
            source={{ uri: previewUri }}
            style={styles.preview}
          />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text variant="bodyMuted">No photo selected</Text>
          </View>
        )}

        <Card style={styles.card}>
          <Text variant="label">Add details (optional)</Text>
          <Text variant="caption" style={styles.hint}>
            {MEAL_PHOTO_DESCRIPTION_HINT}
          </Text>
          <TextInput
            accessibilityLabel="Optional meal description for photo estimate"
            multiline
            placeholder={MEAL_PHOTO_DESCRIPTION_PLACEHOLDER}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            editable={!isEstimating}
          />
        </Card>

        {error ? <Text variant="body" style={styles.errorText}>{error}</Text> : null}
        {showManualFallbackCta ? (
          <Button label="Enter manually" onPress={openManualFallback} disabled={isEstimating} />
        ) : null}
        {loadingMessage ? (
          <Text variant="bodyMuted" style={styles.loadingMessage} accessibilityLiveRegion="polite">
            {loadingMessage}
          </Text>
        ) : null}

        <Button
          label={isEstimating ? 'Estimating...' : 'Take Photo'}
          onPress={() => void selectPhoto('camera')}
          disabled={isEstimating}
        />
        <Button
          label="Choose from Library"
          variant="secondary"
          onPress={() => void selectPhoto('library')}
          disabled={isEstimating}
        />
        {previewUri ? (
          <Button
            label="Estimate Selected Photo"
            onPress={() => void estimateSelectedPhoto()}
            disabled={isEstimating}
          />
        ) : null}
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

const styles = createDynamicStyles(() => ({
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
  hint: {
    color: colors.textMuted,
  },
  input: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    padding: spacing.sm,
    color: colors.textDark,
    textAlignVertical: 'top',
    backgroundColor: colors.surfaceCanvas,
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceCanvas,
  },
  previewPlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCanvas,
  },
  errorText: {
    color: colors.brandPrimary,
  },
  loadingMessage: {
    color: colors.brandSecondaryText,
    textAlign: 'center',
  },
}));
