import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors, spacing, createDynamicStyles } from '@/theme';

export interface WeeklyReportCardData {
  weekLabel: string;
  workoutsCompleted: number;
  workoutsPlanned: number;
  adherencePercent: number;
  averageCalories?: number;
  calorieTarget?: number;
  bodyFatDelta?: number | null;
  summary: string;
  nextWeekFocus: string;
  targetAdjustmentSummary?: string;
}

interface WeeklyReportCardProps {
  data: WeeklyReportCardData;
}

export function WeeklyReportCard({ data }: WeeklyReportCardProps) {
  const completionLabel = `${data.workoutsCompleted}/${data.workoutsPlanned} sessions`;
  const calorieLabel =
    data.averageCalories !== undefined && data.calorieTarget !== undefined
      ? `${Math.round(data.averageCalories)} / ${Math.round(data.calorieTarget)} kcal avg`
      : null;

  return (
    <Card style={styles.card}>
      <Text variant="label" style={styles.eyebrow}>
        End-of-week report card
      </Text>
      <Text variant="h2" style={styles.title}>
        {data.weekLabel}
      </Text>
      <Text variant="bodyMuted" style={styles.summary}>
        {data.summary}
      </Text>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text variant="h2" style={styles.metricValue}>
            {data.adherencePercent}%
          </Text>
          <Text variant="caption" style={styles.metricLabel}>
            Adherence
          </Text>
        </View>
        <View style={styles.metric}>
          <Text variant="h2" style={styles.metricValue}>
            {completionLabel}
          </Text>
          <Text variant="caption" style={styles.metricLabel}>
            Training
          </Text>
        </View>
        {calorieLabel ? (
          <View style={styles.metric}>
            <Text variant="body" style={styles.metricValueCompact}>
              {calorieLabel}
            </Text>
            <Text variant="caption" style={styles.metricLabel}>
              Nutrition
            </Text>
          </View>
        ) : null}
      </View>

      {data.bodyFatDelta !== undefined && data.bodyFatDelta !== null ? (
        <Text variant="caption" style={styles.delta}>
          Body-fat estimate change: {data.bodyFatDelta > 0 ? '+' : ''}
          {data.bodyFatDelta.toFixed(1)} pts
        </Text>
      ) : null}

      {data.targetAdjustmentSummary ? (
        <View style={styles.nextWeek}>
          <Text variant="label">Coach calorie update</Text>
          <Text variant="bodyMuted">{data.targetAdjustmentSummary}</Text>
        </View>
      ) : null}

      <View style={styles.nextWeek}>
        <Text variant="label">Next week</Text>
        <Text variant="bodyMuted">{data.nextWeekFocus}</Text>
      </View>
    </Card>
  );
}

const styles = createDynamicStyles(() => ({
  card: {
    gap: spacing.xs,
    backgroundColor: colors.surfaceHero,
  },
  eyebrow: {
    color: colors.brandPrimary,
  },
  title: {
    color: colors.textStrong,
  },
  summary: {
    lineHeight: 22,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  metric: {
    minWidth: 96,
    gap: 2,
  },
  metricValue: {
    color: colors.brandPrimary,
  },
  metricValueCompact: {
    color: colors.brandPrimary,
  },
  metricLabel: {
    color: colors.textMuted,
  },
  delta: {
    color: colors.accentWarm,
  },
  nextWeek: {
    marginTop: spacing.xs,
    gap: 4,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
}));
