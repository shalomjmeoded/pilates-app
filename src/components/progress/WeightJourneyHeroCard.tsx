import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { WeightJourney } from '@/types/progress';
import { colors, radius, spacing } from '@/theme';
import { displayWeight } from '@/utils/units';

interface WeightJourneyHeroCardProps {
  journey: WeightJourney;
  weightUnit: 'kg' | 'lb';
}

export function WeightJourneyHeroCard({ journey, weightUnit }: WeightJourneyHeroCardProps) {
  const start = formatShort(journey.startWeightKg, weightUnit);
  const current = formatShort(journey.currentWeightKg, weightUnit);
  const goal = formatShort(journey.goalWeightKg, weightUnit);

  return (
    <Card style={styles.card}>
      <Text variant="label" style={styles.eyebrow}>
        Weight journey
      </Text>
      <Text variant="h2" style={styles.path}>
        {start} → {current} → Goal {goal}
      </Text>
      <Text variant="body" style={styles.delta}>
        {journey.differenceLabel}
      </Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${journey.progressPercent}%` }]} />
      </View>
      <Text variant="bodyMuted" style={styles.progressLabel}>
        {journey.progressPercent}% toward goal
      </Text>
    </Card>
  );
}

function formatShort(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'kg') {
    return `${kg}kg`;
  }
  const value = displayWeight(kg, 'lb').replace(' lb', 'lb');
  return value;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  eyebrow: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  path: {
    lineHeight: 30,
  },
  delta: {
    color: colors.brandPrimary,
    fontSize: 18,
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accentCool,
  },
  progressLabel: {
    marginTop: 4,
  },
});
