import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { formatTrendLabel } from '@/engines/progress/weightTrends';
import type { WeightTrendAverages } from '@/types/progress';
import { kgToLb } from '@/utils/units';
import { colors, spacing } from '@/theme';

interface WeightTrendSummaryProps {
  trends: WeightTrendAverages;
  weightUnit: 'kg' | 'lb';
}

export function WeightTrendSummary({ trends, weightUnit }: WeightTrendSummaryProps) {
  return (
    <Card style={styles.card} accessibilityRole="summary" accessibilityLabel="Weight trend averages">
      <Text variant="label" style={styles.eyebrow}>
        Trend averages
      </Text>
      <View style={styles.row}>
        <Text variant="body">
          7-day avg: {formatTrendLabel(trends.weeklyAverageKg, weightUnit, kgToLb)}
        </Text>
        <Text variant="body">
          30-day avg: {formatTrendLabel(trends.monthlyAverageKg, weightUnit, kgToLb)}
        </Text>
      </View>
      <Text variant="bodyMuted">Averages smooth daily fluctuations.</Text>
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
  row: {
    gap: 4,
  },
});
