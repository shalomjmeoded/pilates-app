import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { AdherenceMetric } from '@/types/progress';
import { colors, radius, spacing } from '@/theme';

interface AdherenceCardProps {
  metric: AdherenceMetric;
}

export function AdherenceCard({ metric }: AdherenceCardProps) {
  return (
    <Card style={styles.card}>
      <Text variant="label" style={styles.label}>
        {metric.label}
      </Text>
      <Text variant="h1" style={styles.value}>
        {metric.adherencePercent}%
      </Text>
      <Text variant="bodyMuted">adherence</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${metric.adherencePercent}%` }]} />
      </View>
      <Text variant="bodyMuted" style={styles.sub}>
        Last 7 days average
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    gap: 2,
  },
  label: {
    color: colors.textMuted,
  },
  value: {
    fontSize: 28,
    lineHeight: 32,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accentWarm,
    borderRadius: radius.pill,
  },
  sub: {
    marginTop: 4,
    fontSize: 12,
  },
});
