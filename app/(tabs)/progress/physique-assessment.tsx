import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import {
  formatBodyFatRange,
  formatPhysiqueCategory,
  formatPhysiqueConfidence,
  PHYSIQUE_DISCLAIMER_COPY,
  PHYSIQUE_EXPERIMENTAL_NOTE,
} from '@/engines/physique/physiqueAssessmentFlow';
import { usePhysiqueAssessment } from '@/hooks/usePhysiqueAssessment';
import { colors, radius, spacing } from '@/theme';

export default function PhysiqueAssessmentScreen() {
  const router = useRouter();
  const { latest, isLoading, error, load, deleteAssessment } = usePhysiqueAssessment();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const startCapture = () => {
    if (!disclaimerAccepted) {
      return;
    }
    router.push({
      pathname: '/(tabs)/progress/physique-assessment-capture',
      params: { disclaimerAcceptedAt: new Date().toISOString() },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar hasUnsavedChanges={disclaimerAccepted} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="h1">Visual Physique Assessment</Text>
        <Text variant="bodyMuted">Experimental premium feature</Text>

        <Card style={styles.card}>
          <Text variant="body">{PHYSIQUE_DISCLAIMER_COPY}</Text>
          <Text variant="bodyMuted">{PHYSIQUE_EXPERIMENTAL_NOTE}</Text>
        </Card>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: disclaimerAccepted }}
          onPress={() => setDisclaimerAccepted((value) => !value)}
          style={styles.checkboxRow}
        >
          <View style={[styles.checkbox, disclaimerAccepted && styles.checkboxChecked]} />
          <Text variant="body">I understand this is experimental and not medical advice.</Text>
        </Pressable>

        {latest ? (
          <Card style={styles.card}>
            <Text variant="label">Latest saved assessment</Text>
            <Text variant="h2">{formatPhysiqueCategory(latest.physiqueCategory)}</Text>
            <Text variant="body">
              Range: {formatBodyFatRange(latest.estimatedBodyFatRange)}
            </Text>
            <Text variant="bodyMuted">{formatPhysiqueConfidence(latest.confidence)}</Text>
            <Text variant="label">Nutrition idea</Text>
            <Text variant="body">{latest.nutritionAdjustmentSuggestion}</Text>
            <Text variant="label">Workout focus</Text>
            <Text variant="body">{latest.workoutFocusSuggestion}</Text>
            <Button
              label="Delete assessment"
              variant="secondary"
              onPress={() => void deleteAssessment(latest.id)}
            />
          </Card>
        ) : null}

        {error ? <Text variant="body" style={styles.errorText}>{error}</Text> : null}

        <Button
          label="Continue to photo upload"
          onPress={startCapture}
          disabled={!disclaimerAccepted || isLoading}
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  errorText: {
    color: colors.brandPrimary,
  },
});
