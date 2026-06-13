import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { MilestoneStatus } from '@/types/progress';
import { colors, spacing } from '@/theme';

interface MilestoneGridProps {
  milestones: MilestoneStatus[];
}

export function MilestoneGrid({ milestones }: MilestoneGridProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="h2">Milestones</Text>
      <View style={styles.grid}>
        {milestones.map((milestone) => (
          <Animated.View
            key={milestone.key}
            entering={FadeInUp.duration(milestone.unlocked ? 320 : 180)}
          >
            <Card style={[styles.card, !milestone.unlocked && styles.cardLocked]}>
              <Text variant="label" style={milestone.unlocked ? styles.unlocked : styles.locked}>
                {milestone.unlocked ? 'Unlocked' : 'Locked'}
              </Text>
              <Text variant="body" style={!milestone.unlocked ? styles.mutedTitle : undefined}>
                {milestone.title}
              </Text>
              <Text variant="bodyMuted" style={styles.description}>
                {milestone.description}
              </Text>
            </Card>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  grid: {
    gap: spacing.sm,
  },
  card: {
    gap: 4,
  },
  cardLocked: {
    opacity: 0.72,
    backgroundColor: colors.backgroundPrimary,
  },
  unlocked: {
    color: colors.brandPrimary,
  },
  locked: {
    color: colors.textMuted,
  },
  mutedTitle: {
    color: colors.textMuted,
  },
  description: {
    fontSize: 13,
  },
});
