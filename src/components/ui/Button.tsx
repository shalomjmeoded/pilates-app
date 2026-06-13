import { Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, shadows, spacing } from '@/theme';
import { fontFamily } from '@/theme/typography';

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
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fontFamily.semibold,
    letterSpacing: 0.2,
  },
  primaryLabel: {
    color: colors.warmWhite,
  },
  secondaryLabel: {
    color: colors.brandPrimary,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.plum,
    ...shadows.card,
  },
  secondary: {
    backgroundColor: colors.surfaceRose,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  square: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.square,
    borderWidth: 1,
    borderColor: colors.plum,
  },
});
