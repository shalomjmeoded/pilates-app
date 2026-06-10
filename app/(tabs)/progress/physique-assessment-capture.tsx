import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { usePhysiquePhotoAssessment } from '@/hooks/usePhysiquePhotoAssessment';
import type { PhysiquePhotoAngle } from '@/types/physiqueAssessment';
import { colors, radius, spacing } from '@/theme';

const ANGLES: Array<{ angle: PhysiquePhotoAngle; label: string; required?: boolean }> = [
  { angle: 'front', label: 'Front photo', required: true },
  { angle: 'side', label: 'Side photo (strongly recommended)' },
  { angle: 'back', label: 'Back photo (optional)' },
];

export default function PhysiqueAssessmentCaptureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ disclaimerAcceptedAt: string }>();
  const disclaimerAcceptedAt = params.disclaimerAcceptedAt ?? '';

  useEffect(() => {
    if (!disclaimerAcceptedAt) {
      router.replace('/(tabs)/progress/physique-assessment');
    }
  }, [disclaimerAcceptedAt, router]);

  const {
    photos,
    notes,
    setNotes,
    error,
    isAssessing,
    selectPhoto,
    clearPhoto,
    assess,
  } = usePhysiquePhotoAssessment(disclaimerAcceptedAt);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="h1">Upload Photos</Text>
        <Text variant="bodyMuted">
          Front photo is required. Add a side photo for much better body-fat accuracy.
        </Text>

        {ANGLES.map(({ angle, label, required }) => (
          <Card key={angle} style={styles.card}>
            <Text variant="label">{label}</Text>
            {photos[angle] ? (
              <Image
                accessibilityLabel={`${label} preview`}
                source={{ uri: photos[angle]! }}
                style={styles.preview}
              />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Text variant="bodyMuted">{required ? 'Required' : 'Optional'}</Text>
              </View>
            )}
            <Button
              label="Take Photo"
              onPress={() => void selectPhoto(angle, 'camera')}
              disabled={isAssessing}
            />
            <Button
              label="Choose from Library"
              variant="secondary"
              onPress={() => void selectPhoto(angle, 'library')}
              disabled={isAssessing}
            />
            {photos[angle] ? (
              <Button
                label="Remove photo"
                variant="secondary"
                onPress={() => clearPhoto(angle)}
                disabled={isAssessing}
              />
            ) : null}
          </Card>
        ))}

        <Card style={styles.card}>
          <Text variant="label">Notes (optional)</Text>
          <TextInput
            accessibilityLabel="Assessment notes"
            multiline
            placeholder="Lighting, time of day, anything that might help context"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
          />
        </Card>

        {error ? <Text variant="body" style={styles.errorText}>{error}</Text> : null}

        <Button
          label={isAssessing ? 'Assessing...' : 'Run assessment'}
          onPress={() => void assess()}
          disabled={isAssessing || !photos.front}
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
    paddingBottom: spacing.lg,
  },
  card: {
    gap: spacing.xs,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceCanvas,
  },
  previewPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCanvas,
  },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    padding: spacing.sm,
    color: colors.textDark,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.brandPrimary,
  },
});
