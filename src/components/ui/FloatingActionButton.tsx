import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { colors, radius, shadows, spacing } from '@/theme';

interface FloatingActionButtonProps {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function FloatingActionButton({
  label,
  onPress,
  accessibilityLabel,
}: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        shadows.card,
        { bottom: Math.max(insets.bottom, spacing.sm) },
        pressed && styles.pressed,
      ]}
    >
      <Feather name="plus" size={22} color={colors.warmWhite} />
      <Text variant="body" style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
    minHeight: 52,
  },
  label: {
    color: colors.warmWhite,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
