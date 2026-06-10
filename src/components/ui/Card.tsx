import { ReactNode } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { colors, radius, shadows, spacing } from '@/theme';

interface CardProps extends ViewProps {
  children: ReactNode;
  elevated?: boolean;
}

export function Card({ children, style, elevated = true, ...props }: CardProps) {
  return (
    <View style={[styles.card, elevated && shadows.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
  },
});
