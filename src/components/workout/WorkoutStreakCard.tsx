import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { WorkoutStreakStats } from '@/types/workout';
import { colors, spacing } from '@/theme';

interface WorkoutStreakCardProps {
  stats: WorkoutStreakStats;
}

export function WorkoutStreakCard({ stats }: WorkoutStreakCardProps) {
  return (
    <Card style={styles.card} accessibilityRole="summary" accessibilityLabel="Workout streak summary">
      <Text variant="label" style={styles.eyebrow}>
        Movement streak
      </Text>
      <View style={styles.row}>
        <Stat label="Current" value={`${stats.currentStreak} days`} />
        <Stat label="Best" value={`${stats.longestStreak} days`} />
        <Stat label="This month" value={`${stats.monthlyCompletionPercent}%`} />
      </View>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="bodyMuted">{label}</Text>
      <Text variant="h2" style={styles.value}>
        {value}
      </Text>
    </View>
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
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    gap: 4,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.xs,
  },
  value: {
    fontSize: 20,
    lineHeight: 24,
  },
});
