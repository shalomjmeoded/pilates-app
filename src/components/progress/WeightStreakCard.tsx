import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { WeightStreakStats } from '@/types/progress';
import { colors, spacing } from '@/theme';

interface WeightStreakCardProps {
  stats: WeightStreakStats;
}

export function WeightStreakCard({ stats }: WeightStreakCardProps) {
  return (
    <Card style={styles.card} accessibilityRole="summary" accessibilityLabel="Weight logging streak">
      <Text variant="label" style={styles.eyebrow}>
        Weigh-in streak
      </Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text variant="bodyMuted">Current</Text>
          <Text variant="h2">{stats.currentStreak} days</Text>
        </View>
        <View style={styles.stat}>
          <Text variant="bodyMuted">Best</Text>
          <Text variant="h2">{stats.longestStreak} days</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    gap: 4,
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.xs,
  },
});
