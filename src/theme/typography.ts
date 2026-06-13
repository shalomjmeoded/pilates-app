import { TextStyle } from 'react-native';

import { colors } from './tokens';

export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

export const typography = {
  hero: {
    fontFamily: fontFamily.bold,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -1,
    color: colors.textStrong,
  } satisfies TextStyle,
  section: {
    fontFamily: fontFamily.semibold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.4,
    color: colors.textDark,
  } satisfies TextStyle,
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.8,
    color: colors.textDark,
  } satisfies TextStyle,
  h2: {
    fontFamily: fontFamily.semibold,
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.3,
    color: colors.textDark,
  } satisfies TextStyle,
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textDark,
  } satisfies TextStyle,
  bodyMuted: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  } satisfies TextStyle,
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: colors.textMuted,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  display: {
    fontFamily: fontFamily.bold,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -1,
    color: colors.textDark,
  } satisfies TextStyle,
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
    color: colors.textMuted,
  } satisfies TextStyle,
} as const;
