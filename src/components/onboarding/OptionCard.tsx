import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';
import { selectionHaptic } from '@/utils/haptics';

interface OptionCardProps {
  label: string;
  description?: string;
  selected?: boolean;
  accessibilityLabel?: string;
  selectionMode?: 'single' | 'multiple';
  index?: number;
  onPress: () => void;
}

export function OptionCard({
  label,
  description,
  selected = false,
  accessibilityLabel,
  selectionMode = 'single',
  index = 0,
  onPress,
}: OptionCardProps) {
  const accessibilityRole = selectionMode === 'multiple' ? 'checkbox' : 'radio';
  const accessibilityState =
    selectionMode === 'multiple' ? { checked: selected } : { selected };

  const handlePress = () => {
    selectionHaptic();
    onPress();
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 45).duration(260)}>
      <Pressable
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={accessibilityState}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          selected && styles.cardSelected,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.content}>
          <Text variant="body" style={selected ? styles.labelSelected : undefined}>
            {label}
          </Text>
          {description ? (
            <Text variant="bodyMuted" style={styles.description}>
              {description}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.indicator,
            selectionMode === 'multiple' && styles.indicatorMultiple,
            selected && styles.indicatorSelected,
          ]}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 72,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
    gap: spacing.sm,
  },
  cardSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surfaceRose,
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    transform: [{ scale: 1.01 }],
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  content: {
    flex: 1,
    gap: 4,
  },
  labelSelected: {
    color: colors.brandPrimary,
  },
  description: {
    lineHeight: 20,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  indicatorMultiple: {
    borderRadius: radius.square,
  },
  indicatorSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandPrimary,
  },
});
