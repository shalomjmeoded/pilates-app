import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

import { typography } from '@/theme/typography';

type TextVariant =
  | 'hero'
  | 'section'
  | 'display'
  | 'h1'
  | 'h2'
  | 'body'
  | 'bodyMuted'
  | 'label'
  | 'caption';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
}

const MAX_FONT_SCALE = 1.6;

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
