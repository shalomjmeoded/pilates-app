import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, shadows, spacing } from '@/theme';

interface WorkoutCompletedBannerProps {
  movementCount: number;
  streakDays?: number;
}

export function WorkoutCompletedBanner({ movementCount, streakDays }: WorkoutCompletedBannerProps) {
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
          {streakDays && streakDays > 0
            ? ` ${streakDays} day rhythm and counting.`
            : ' Rest well and return when it feels right.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    gap: 4,
  },
  title: {
    color: colors.textStrong,
  },
  message: {
    lineHeight: 22,
  },
});
