import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { WorkoutStreakStats } from '@/types/workout';
import { colors, radius, shadows, spacing, createDynamicStyles } from '@/theme';

interface WorkoutHeroCardProps {
  focusTitle: string;
  whyThisWorkout: string;
  movementCount: number;
  estimatedMinutes: number;
  streak?: WorkoutStreakStats | null;
  canStart: boolean;
  startUnavailableReason?: string;
  onChangeWorkout?: () => void;
  onTakeRestDay?: () => void;
  onStart: () => void;
}

export function WorkoutHeroCard({
  focusTitle,
  whyThisWorkout,
  movementCount,
  estimatedMinutes,
  streak,
  canStart,
  startUnavailableReason,
  onChangeWorkout,
  onTakeRestDay,
  onStart,
}: WorkoutHeroCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.heroWrap, shadows.hero]}>
      <View style={styles.heroAccent} />
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text variant="label" style={styles.eyebrow}>
            Today&apos;s focus
          </Text>
          <Text variant="hero" style={styles.title}>
            {focusTitle}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Collapse workout details' : 'Expand workout details'}
          accessibilityState={{ expanded }}
          hitSlop={10}
          onPress={() => setExpanded((value) => !value)}
          style={({ pressed }) => [styles.expandButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.brandPrimary}
          />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <MetaChip icon="format-list-numbered" label={`${movementCount} movements`} />
        <MetaChip icon="clock-outline" label={`About ${estimatedMinutes} min`} />
      </View>

      <View style={styles.actions}>
        {canStart ? <Button label="Start Workout" onPress={onStart} /> : null}
        {!canStart && startUnavailableReason ? (
          <View style={styles.startUnavailable} accessibilityRole="text">
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color={colors.brandPrimary}
            />
            <Text variant="caption" style={styles.startUnavailableText}>
              {startUnavailableReason}
            </Text>
          </View>
        ) : null}
        {onChangeWorkout ? (
          <Button label="Change Workout" variant="secondary" onPress={onChangeWorkout} />
        ) : null}
        {onTakeRestDay ? (
          <Button label="Take a rest day" variant="secondary" onPress={onTakeRestDay} />
        ) : null}
      </View>

      {expanded ? (
        <View style={styles.details}>
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
        </View>
      ) : null}
    </View>
  );
}

function MetaChip({ icon, label }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }) {
  return (
    <View style={styles.chip}>
      <MaterialCommunityIcons name={icon} size={16} color={colors.brandPrimary} />
      <Text
        variant="caption"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.86}
        style={styles.chipText}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
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
    color: colors.brandSecondaryText,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.textStrong,
    fontSize: 26,
    lineHeight: 32,
  },
  expandButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCanvas,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  details: {
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 0,
    gap: 4,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipText: {
    flexShrink: 1,
    textAlign: 'center',
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
  },
  startUnavailable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
  },
  startUnavailableText: {
    flex: 1,
    lineHeight: 18,
  },
}));
