import { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

import { colors, radius, shadows, spacing, createDynamicStyles } from '@/theme';

interface CardProps extends ViewProps {
  children: ReactNode;
  elevated?: boolean;
}

export function Card({ children, style, elevated = true, ...props }: CardProps) {
  return (
    <View style={[styles.card, elevated ? styles.elevated : styles.flat, style]} {...props}>
      {children}
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  card: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1.25,
    padding: spacing.sm,
  },
  elevated: {
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  flat: {
    borderColor: colors.borderLight,
  },
}));
