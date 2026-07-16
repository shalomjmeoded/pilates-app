import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { AdherenceMetric } from '@/types/progress';
import { colors, radius, spacing } from '@/theme';

interface NutritionAdherenceSummaryProps {
  calories: AdherenceMetric;
  protein: AdherenceMetric;
  fiber: AdherenceMetric;
}

export function NutritionAdherenceSummary({
  calories,
  protein,
  fiber,
}: NutritionAdherenceSummaryProps) {
  const average = Math.round(
    (calories.adherencePercent + protein.adherencePercent + fiber.adherencePercent) / 3,
  );
  const status =
    average >= 80
      ? 'On track this week'
      : average >= 60
        ? 'Building consistency'
        : 'A gentle reset can help';

  return (
    <Card style={styles.card} accessibilityLabel="Nutrition adherence over the last seven days">
      <View style={styles.header}>
        <View style={styles.statusIcon}>
          <MaterialCommunityIcons
            name={average >= 80 ? 'check' : 'leaf'}
            size={17}
            color={colors.brandPrimary}
          />
        </View>
        <View style={styles.headerCopy}>
          <Text variant="body" style={styles.status}>{status}</Text>
          <Text variant="caption">Last 7 days</Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <AdherenceRow metric={calories} />
        <View style={styles.divider} />
        <AdherenceRow metric={protein} />
        <View style={styles.divider} />
        <AdherenceRow metric={fiber} />
      </View>
    </Card>
  );
}

function AdherenceRow({ metric }: { metric: AdherenceMetric }) {
  return (
    <View style={styles.metricRow}>
      <Text variant="bodyMuted" style={styles.metricLabel}>{metric.label}</Text>
      <Text variant="body" style={styles.metricValue}>{metric.adherencePercent}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    backgroundColor: colors.surfaceCanvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRose,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  headerCopy: {
    flex: 1,
    gap: 1,
  },
  status: {
    color: colors.textStrong,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  metrics: {
    borderRadius: radius.square,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.xs,
  },
  metricRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  metricLabel: {
    flex: 1,
  },
  metricValue: {
    color: colors.brandPrimary,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
});
