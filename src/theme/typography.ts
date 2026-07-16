import { TextStyle } from 'react-native';

import { colors, getActiveColorScheme, type ResolvedColorScheme } from './tokens';

export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  /** Editorial serif display faces — used for headings in the luxe theme. */
  serifSemibold: 'PlayfairDisplay_600SemiBold',
  serifBold: 'PlayfairDisplay_700Bold',
} as const;

type TypographyScale = {
  hero: TextStyle;
  section: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  body: TextStyle;
  bodyMuted: TextStyle;
  label: TextStyle;
  display: TextStyle;
  caption: TextStyle;
};

function buildTypography(scheme: ResolvedColorScheme): TypographyScale {
  const isLuxe = scheme === 'luxe';
  const isPride = scheme === 'pride';
  const displayFont = isLuxe ? fontFamily.serifBold : fontFamily.bold;
  const headingFont = isLuxe ? fontFamily.serifSemibold : fontFamily.semibold;
  const displayTracking = isLuxe ? -0.2 : isPride ? -0.5 : -1;
  const headingTracking = isLuxe ? 0 : isPride ? -0.2 : -0.4;

  return {
    hero: {
      fontFamily: displayFont,
      fontSize: 38,
      lineHeight: 44,
      letterSpacing: displayTracking,
      color: colors.textStrong,
    },
    section: {
      fontFamily: headingFont,
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: headingTracking,
      color: colors.textDark,
    },
    h1: {
      fontFamily: displayFont,
      fontSize: 30,
      lineHeight: 38,
      letterSpacing: isLuxe ? -0.2 : isPride ? -0.5 : -0.8,
      color: colors.textDark,
    },
    h2: {
      fontFamily: headingFont,
      fontSize: 22,
      lineHeight: 30,
      letterSpacing: isLuxe ? 0 : isPride ? -0.2 : -0.3,
      color: colors.textDark,
    },
    body: {
      fontFamily: fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
      color: colors.textDark,
    },
    bodyMuted: {
      fontFamily: fontFamily.regular,
      fontSize: 16,
      lineHeight: 24,
      color: colors.textMuted,
    },
    label: {
      fontFamily: fontFamily.medium,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: isPride ? 0.6 : 0.4,
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    display: {
      fontFamily: displayFont,
      fontSize: 34,
      lineHeight: 42,
      letterSpacing: displayTracking,
      color: colors.textDark,
    },
    caption: {
      fontFamily: fontFamily.medium,
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: 0.2,
      color: colors.textMuted,
    },
  };
}

let cachedScheme: ResolvedColorScheme | null = null;
let cachedTypography: TypographyScale | null = null;

function getTypography(): TypographyScale {
  const scheme = getActiveColorScheme();
  if (!cachedTypography || cachedScheme !== scheme) {
    cachedScheme = scheme;
    cachedTypography = buildTypography(scheme);
  }
  return cachedTypography;
}

/** Rebuilds when the active color scheme changes. */
export const typography: TypographyScale = new Proxy({} as TypographyScale, {
  get(_target, prop) {
    if (typeof prop === 'symbol' || prop === 'then') {
      return undefined;
    }
    return getTypography()[prop as keyof TypographyScale];
  },
  ownKeys() {
    return Reflect.ownKeys(getTypography());
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Object.getOwnPropertyDescriptor(getTypography(), prop);
  },
  has(_target, prop) {
    return prop in getTypography();
  },
});
