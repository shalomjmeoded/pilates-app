import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { WorkoutStreakStats } from '@/types/workout';
import { colors, radius, shadows, spacing } from '@/theme';

interface WorkoutHeroCardProps {
  focusTitle: string;
  whyThisWorkout: string;
  movementCount: number;
  estimatedMinutes: number;
  streak?: WorkoutStreakStats | null;
  canStart: boolean;
  onChangeWorkout?: () => void;
  onStart: () => void;
}

export function WorkoutHeroCard({
  focusTitle,
  whyThisWorkout,
  movementCount,
  estimatedMinutes,
  streak,
  canStart,
  onChangeWorkout,
  onStart,
}: WorkoutHeroCardProps) {
  return (
    <View style={[styles.heroWrap, shadows.hero]}>
      <View style={styles.heroAccent} />
      <Text variant="label" style={styles.eyebrow}>
        Today&apos;s focus
      </Text>
      <Text variant="hero" style={styles.title}>
        {focusTitle}
      </Text>
      <View style={styles.metaRow}>
        <MetaChip icon="format-list-numbered" label={`${movementCount} movements`} />
        <MetaChip icon="clock-outline" label={`${estimatedMinutes} min`} />
      </View>

      {streak && streak.currentStreak > 0 ? (
        <View style={styles.streakRow}>
          <MaterialCommunityIcons name="fire" size={18} color={colors.brandSecondary} />
          <Text variant="body" style={styles.streak}>
            {streak.currentStreak} day rhythm · best {streak.longestStreak}
          </Text>
        </View>
      ) : (
        <Text variant="bodyMuted" style={styles.streakEncourage}>
          Every session builds your rhythm — start when you&apos;re ready.
        </Text>
      )}

      <View style={styles.whyCard}>
        <Text variant="caption" style={styles.whyLabel}>
          Why this workout?
        </Text>
        <Text variant="body" style={styles.whyText}>
          {whyThisWorkout}
        </Text>
      </View>

      {onChangeWorkout ? (
        <Card elevated={false} style={styles.secondaryWrap}>
          <Text variant="caption" style={styles.coachHint}>
            Need a different focus? Your coach can adapt today&apos;s plan.
          </Text>
        </Card>
      ) : null}

      <View style={styles.actions}>
        {onChangeWorkout ? (
          <Button label="Change Workout" variant="secondary" onPress={onChangeWorkout} />
        ) : null}
        {canStart ? <Button label="Start Workout" onPress={onStart} /> : null}
      </View>
    </View>
  );
}

function MetaChip({ icon, label }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }) {
  return (
    <View style={styles.chip}>
      <MaterialCommunityIcons name={icon} size={16} color={colors.brandPrimary} />
      <Text variant="caption">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    backgroundColor: colors.surfaceHero,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.md,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  heroAccent: {
    position: 'absolute',
    top: -50,
    left: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.surfaceRose,
    opacity: 0.45,
  },
  eyebrow: {
    color: colors.brandSecondary,
  },
  title: {
    color: colors.textStrong,
    fontSize: 30,
    lineHeight: 36,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streak: {
    color: colors.brandPrimary,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  streakEncourage: {
    lineHeight: 22,
  },
  whyCard: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    gap: 4,
  },
  whyLabel: {
    color: colors.brandPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  whyText: {
    lineHeight: 22,
  },
  secondaryWrap: {
    backgroundColor: colors.surfaceMuted,
    paddingVertical: spacing.xs,
  },
  coachHint: {
    textAlign: 'center',
    lineHeight: 18,
  },
  actions: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
