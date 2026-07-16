import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { RecalibrationComparison } from '@/types/settings';
import { colors, spacing } from '@/theme';

interface PlanUpdatedCardProps {
  comparison: RecalibrationComparison;
}

export function PlanUpdatedCard({ comparison }: PlanUpdatedCardProps) {
  return (
    <Card style={styles.card}>
      <Text variant="h2">Your plan has been updated.</Text>
      <MacroRow label="Calories" before={comparison.previous.calories} after={comparison.next.calories} suffix="kcal" />
      <MacroRow label="Protein" before={comparison.previous.proteinG} after={comparison.next.proteinG} suffix="g" />
      <MacroRow label="Carbs" before={comparison.previous.carbsG} after={comparison.next.carbsG} suffix="g" />
      <MacroRow label="Fat" before={comparison.previous.fatG} after={comparison.next.fatG} suffix="g" />
    </Card>
  );
}

function MacroRow({
  label,
  before,
  after,
  suffix,
}: {
  label: string;
  before: number;
  after: number;
  suffix: string;
}) {
  return (
    <View style={styles.row}>
      <Text variant="label" style={styles.label}>
        {label}
      </Text>
      <Text variant="body">
        {Math.round(before)} {suffix} → {Math.round(after)} {suffix}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  row: {
    gap: 4,
  },
  label: {
    color: colors.textMuted,
  },
});
