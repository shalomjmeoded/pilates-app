import { useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { MEAL_PHOTO_AI_DISCLOSURE } from '@/constants/compliance';
import { useMealPhotoEstimate } from '@/hooks/useMealPhotoEstimate';
import { colors, radius, spacing } from '@/theme';

export default function AddPhotoEstimateScreen() {
  const params = useLocalSearchParams<{ mealDate: string }>();
  const mealDate = params.mealDate ?? new Date().toISOString().slice(0, 10);

  const {
    previewUri,
    error,
    isEstimating,
    selectPhoto,
    estimateSelectedPhoto,
    openManualFallback,
  } = useMealPhotoEstimate(mealDate);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar hasUnsavedChanges={previewUri !== null} />
      <View style={styles.container}>
        <Text variant="h1">Photo Estimate</Text>
        <Text variant="bodyMuted">
          Photo estimates are best for simple visible meals. Premium only.
        </Text>

        <Card style={styles.card}>
          <Text variant="body">
            {MEAL_PHOTO_AI_DISCLOSURE}
          </Text>
        </Card>

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

        {error ? <Text variant="body" style={styles.errorText}>{error}</Text> : null}

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
            variant="secondary"
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    flex: 1,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  card: {
    gap: spacing.xs,
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
});
