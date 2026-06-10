import { Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'square';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: ButtonVariant;
}

export function Button({ label, variant = 'primary', style, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style as ViewStyle,
      ]}
      {...props}
    >
      <Text
        variant="body"
        style={[
          styles.label,
          variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  primaryLabel: {
    color: colors.surfaceCanvas,
  },
  secondaryLabel: {
    color: colors.brandPrimary,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
  },
  secondary: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
  },
  square: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.square,
  },
});
