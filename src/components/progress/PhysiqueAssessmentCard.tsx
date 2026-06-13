import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadErrorState } from '@/components/ui/LoadErrorState';
import { Text } from '@/components/ui/Text';
import {
  formatBodyFatRange,
  formatPhysiqueCategory,
  formatPhysiqueConfidence,
  PHYSIQUE_EXPERIMENTAL_NOTE,
} from '@/engines/physique/physiqueAssessmentFlow';
import type { StoredPhysiqueAssessment } from '@/types/physiqueAssessment';
import { colors, spacing } from '@/theme';

interface PhysiqueAssessmentCardProps {
  latest: StoredPhysiqueAssessment | null;
  isLoading?: boolean;
  error?: string | null;
  onOpen: () => void;
  onRetry?: () => void;
  onDelete?: () => void;
}

export function PhysiqueAssessmentCard({
  latest,
  isLoading = false,
  error,
  onOpen,
  onRetry,
  onDelete,
}: PhysiqueAssessmentCardProps) {
  return (
    <Card style={styles.card}>
      <Text variant="label">Visual physique assessment</Text>
      <Text variant="bodyMuted">Experimental · Premium · One factor only</Text>

      {latest ? (
        <View style={styles.section}>
          <Text variant="h2">{formatPhysiqueCategory(latest.physiqueCategory)}</Text>
          <Text variant="body">
            Estimated range: {formatBodyFatRange(latest.estimatedBodyFatRange)}
          </Text>
          <Text variant="bodyMuted">{formatPhysiqueConfidence(latest.confidence)}</Text>
          <Text variant="bodyMuted">{PHYSIQUE_EXPERIMENTAL_NOTE}</Text>
        </View>
      ) : (
        <Text variant="bodyMuted">
          Optional AI snapshot from photos. When saved, informs your calories, protein, and workouts.
        </Text>
      )}

      {error ? (
        <LoadErrorState
          title="Couldn’t load assessment"
          message="Your saved assessment did not load. Try again in a moment."
          compact
          onRetry={onRetry}
        />
      ) : null}

      <Button
        label={isLoading ? 'Loading...' : latest ? 'View assessment' : 'Start assessment'}
        variant="secondary"
        onPress={onOpen}
        disabled={isLoading}
      />
      {latest && onDelete ? (
        <Button label="Delete assessment" variant="secondary" onPress={onDelete} />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    backgroundColor: colors.surfaceMuted,
  },
  section: {
    gap: 4,
  },
});
