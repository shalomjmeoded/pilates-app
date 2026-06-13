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
      <View style={styles.header}>
        <Text variant="label" style={styles.label}>
          {metric.label}
        </Text>
        <View style={styles.badge}>
          <Text variant="caption" style={styles.badgeText}>
            7D
          </Text>
        </View>
      </View>
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
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  badgeText: {
    color: colors.textMuted,
    textTransform: 'uppercase',
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
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.pill,
  },
  sub: {
    marginTop: 4,
    fontSize: 12,
  },
});
