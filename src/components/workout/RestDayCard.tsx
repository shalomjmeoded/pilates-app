import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radius, shadows, spacing, createDynamicStyles } from '@/theme';

interface RestDayCardProps {
  isToday?: boolean;
  onAddWorkout?: () => void;
  isAddingWorkout?: boolean;
}

export function RestDayCard({ isToday, onAddWorkout, isAddingWorkout }: RestDayCardProps) {
  return (
    <View style={[styles.card, shadows.card]}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="spa-outline" size={28} color={colors.brandPrimary} />
      </View>
      <View style={styles.copy}>
        <Text variant="h2" style={styles.title}>
          {isToday ? 'Rest day today' : 'Rest day'}
        </Text>
        <Text variant="bodyMuted" style={styles.message}>
          Recovery is part of the plan. Stretch lightly if you like, and come back strong on your next
          workout day.
        </Text>
        {onAddWorkout ? (
          <Button
            label={isAddingWorkout ? 'Adding workout…' : 'Add a workout today'}
            variant="secondary"
            onPress={onAddWorkout}
            disabled={isAddingWorkout}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  card: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surfaceRose,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
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
