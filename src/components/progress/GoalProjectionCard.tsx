import { StyleSheet } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { GoalProjection } from '@/types/progress';
import { colors, spacing } from '@/theme';

interface GoalProjectionCardProps {
  projection: GoalProjection;
}

export function GoalProjectionCard({ projection }: GoalProjectionCardProps) {
  return (
    <Card style={styles.card}>
      <Text variant="label" style={styles.eyebrow}>
        Goal projection
      </Text>
      {projection.hasEnoughData && projection.estimatedDate ? (
        <>
          <Text variant="h2">Estimated goal date</Text>
          <Text variant="body" style={styles.date}>
            {projection.estimatedDate}
          </Text>
        </>
      ) : (
        <Text variant="bodyMuted">{projection.message}</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  date: {
    color: colors.brandPrimary,
    fontSize: 18,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
});
