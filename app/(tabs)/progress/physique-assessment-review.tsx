import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { useSavePhysiqueAssessment } from '@/hooks/useSavePhysiqueAssessment';
import { usePhysiqueAssessmentReviewStore } from '@/stores/physiqueAssessmentReviewStore';
import { colors, spacing } from '@/theme';

export default function PhysiqueAssessmentReviewScreen() {
  const router = useRouter();
  const { assessment, clear } = usePhysiqueAssessmentReviewStore();
  const { save, error, isSaving } = useSavePhysiqueAssessment();

  useEffect(() => {
    if (!assessment) {
      router.replace('/(tabs)/progress');
    }
  }, [assessment, router]);

  if (!assessment) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="h1">Review Assessment</Text>
        <Text variant="bodyMuted">
          Review before saving. Tune never auto-saves AI results or changes your plan.
        </Text>

        <Card style={styles.card}>
          <Text variant="body">{PHYSIQUE_DISCLAIMER_COPY}</Text>
          <Text variant="bodyMuted">{PHYSIQUE_EXPERIMENTAL_NOTE}</Text>
        </Card>

        <Card style={styles.card}>
          <Text variant="label">Category</Text>
          <Text variant="h2">{formatPhysiqueCategory(assessment.physiqueCategory)}</Text>
          <Text variant="label">Estimated body fat range</Text>
          <Text variant="body">{formatBodyFatRange(assessment.estimatedBodyFatRange)}</Text>
          <Text variant="label">Confidence</Text>
          <Text variant="body">{formatPhysiqueConfidence(assessment.confidence)}</Text>
          <Text variant="label">Nutrition adjustment idea</Text>
          <Text variant="body">{assessment.nutritionAdjustmentSuggestion}</Text>
          <Text variant="label">Workout focus idea</Text>
          <Text variant="body">{assessment.workoutFocusSuggestion}</Text>
        </Card>

        {error ? <Text variant="body" style={styles.errorText}>{error}</Text> : null}

        <Button
          label={isSaving ? 'Saving...' : 'Save assessment'}
          onPress={() => void save(assessment)}
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
    paddingBottom: spacing.lg,
  },
  card: {
    gap: spacing.xs,
  },
  errorText: {
    color: colors.brandPrimary,
  },
});
