import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { WorkoutStreakStats } from '@/types/workout';
import { colors, spacing } from '@/theme';

interface WorkoutHeroCardProps {
  focusTitle: string;
  movementCount: number;
  estimatedMinutes: number;
  streak?: WorkoutStreakStats | null;
  canStart: boolean;
  onStart: () => void;
}

export function WorkoutHeroCard({
  focusTitle,
  movementCount,
  estimatedMinutes,
  streak,
  canStart,
  onStart,
}: WorkoutHeroCardProps) {
  return (
    <Card style={styles.card}>
      <Text variant="label" style={styles.eyebrow}>
        Today&apos;s focus
      </Text>
      <Text variant="h1" style={styles.title}>
        {focusTitle}
      </Text>
      <View style={styles.metaRow}>
        <Text variant="bodyMuted">{movementCount} movements</Text>
        <Text variant="bodyMuted">·</Text>
        <Text variant="bodyMuted">{estimatedMinutes} min</Text>
      </View>
      {streak ? (
        <Text variant="body" style={styles.streak}>
          {streak.currentStreak} day streak · best {streak.longestStreak}
        </Text>
      ) : null}
      {canStart ? (
        <Button label="Start Workout" onPress={onStart} style={styles.cta} />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    backgroundColor: colors.surfaceRose,
    borderColor: colors.borderLight,
  },
  eyebrow: {
    color: colors.brandPrimary,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.textDark,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  streak: {
    color: colors.brandPrimary,
  },
  cta: {
    marginTop: spacing.xs,
  },
});
