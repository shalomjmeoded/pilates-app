import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radius, shadows, spacing, createDynamicStyles } from '@/theme';
import { workoutStreakEncouragement } from '@/utils/encouragement';

interface WorkoutCompletedBannerProps {
  movementCount: number;
  streakDays?: number;
  /** Dev-only: allow restarting a completed session unlimited times. */
  onRestartDev?: () => void;
}

export function WorkoutCompletedBanner({
  movementCount,
  streakDays,
  onRestartDev,
}: WorkoutCompletedBannerProps) {
  const streakCopy = workoutStreakEncouragement(streakDays);

  return (
    <View style={[styles.banner, shadows.card]}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="heart-outline" size={28} color={colors.brandPrimary} />
      </View>
      <View style={styles.copy}>
        <Text variant="h2" style={styles.title}>
          You showed up today
        </Text>
        <Text variant="bodyMuted" style={styles.message}>
          {movementCount} movements complete — your body thanks you for the care.
          {streakCopy
            ? ` ${streakCopy.title} ${streakCopy.body}`
            : streakDays && streakDays > 0
              ? ` ${streakDays} day rhythm and counting.`
              : ' Rest well and return when it feels right.'}
        </Text>
        {__DEV__ && onRestartDev ? (
          <Button label="Restart workout (dev)" variant="secondary" onPress={onRestartDev} />
        ) : null}
      </View>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  banner: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surfaceRose,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.sm,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceCanvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textStrong,
  },
  message: {
    lineHeight: 22,
  },
}));
