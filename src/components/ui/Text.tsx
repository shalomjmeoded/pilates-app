import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

import { typography } from '@/theme/typography';

type TextVariant = 'h1' | 'h2' | 'body' | 'bodyMuted' | 'label';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
}

const MAX_FONT_SCALE = 1.3;

export function Text({ variant = 'body', style, ...props }: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      style={[styles.base, typography[variant], style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
