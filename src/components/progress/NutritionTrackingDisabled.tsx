import { StyleSheet } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/theme';

export function NutritionTrackingDisabled() {
  return (
    <Card style={styles.card}>
      <Text variant="h2">Nutrition tracking disabled</Text>
      <Text variant="bodyMuted" style={styles.copy}>
        You are in workouts-only mode. Enable full nutrition tracking in Settings to see adherence analytics.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  copy: {
    color: colors.textMuted,
    lineHeight: 22,
  },
});
