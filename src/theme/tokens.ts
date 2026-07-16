/** BetterMe palettes — wellness default, Golden Mode, and Pride. */

/**
 * Default wellness palette — premium, mature, women-friendly Pilates identity.
 */
export const lightColors = {
  plum: '#4A3048',
  dustyRose: '#B8898E',
  warmSand: '#D9C8B4',
  sage: '#8FA68E',
  softCream: '#F7F3ED',
  warmWhite: '#FDFCFA',

  backgroundPrimary: '#F7F3ED',
  surfaceCanvas: '#FDFCFA',
  surfaceRose: '#F5EEEB',
  surfacePeach: '#F3EDE6',
  surfaceSelected: '#F1E8E5',
  surfaceMuted: '#F5F0EB',
  warningSurface: '#F8EDEA',
  illustrationBg: '#EDE4DF',
  surfaceHero: '#F3EAE6',
  surfaceLuxury: '#EFE6E1',

  brandPrimary: '#4A3048',
  brandSecondary: '#B8898E',
  /** Deep dusty rose for text on light surfaces; brandSecondary stays decorative. */
  brandSecondaryText: '#8E5C64',
  accentWarm: '#D9C8B4',
  accentCool: '#8FA68E',
  success: '#8FA68E',

  textDark: '#2D2926',
  textMuted: '#6E6764',
  textStrong: '#1F1C1A',
  borderLight: '#E5DDD6',
  borderStrong: '#CDBEB2',
  destructive: '#8D4958',
} as const;

/**
 * "Golden Mode" — a premium, editorial all-white palette. Warm white surfaces,
 * champagne-gold and blush accents, near-black ink. Paywall-gated.
 */
export const luxeColors = {
  plum: '#F3ECE3',
  dustyRose: '#B0894E',
  warmSand: '#ECE6DE',
  sage: '#B0894E',
  softCream: '#FDFCFA',
  warmWhite: '#FFFFFF',

  backgroundPrimary: '#FDFCFA',
  surfaceCanvas: '#FFFFFF',
  surfaceRose: '#F7F1EA',
  surfacePeach: '#F3ECE4',
  surfaceSelected: '#F4EADA',
  surfaceMuted: '#F6F2EC',
  warningSurface: '#FBF3E4',
  illustrationBg: '#F7F1EA',
  surfaceHero: '#FBF8F3',
  surfaceLuxury: '#F8F1E7',

  brandPrimary: '#B0894E',
  brandSecondary: '#D8A7A0',
  brandSecondaryText: '#A87F51',
  accentWarm: '#D8A7A0',
  accentCool: '#B0894E',
  success: '#7C9A6B',

  textDark: '#1B1A19',
  textMuted: '#8C857D',
  textStrong: '#111010',
  borderLight: '#ECE6DE',
  borderStrong: '#D9CFC1',
  destructive: '#B4534B',
} as const;

/**
 * "Pride" — premium palette with magenta, teal, and soft gold accents on a
 * deep violet base. Paywall-gated.
 */
export const prideColors = {
  plum: '#241433',
  dustyRose: '#6B3A7A',
  warmSand: '#2E1A40',
  sage: '#F472B6',
  softCream: '#12081A',
  warmWhite: '#1A0F24',

  backgroundPrimary: '#12081A',
  surfaceCanvas: '#1A0F24',
  surfaceRose: '#241433',
  surfacePeach: '#2A1840',
  surfaceSelected: '#3A2058',
  surfaceMuted: '#1E1230',
  warningSurface: '#2A2210',
  illustrationBg: '#241433',
  surfaceHero: '#241433',
  surfaceLuxury: '#3A2058',

  brandPrimary: '#F472B6',
  brandSecondary: '#6B3A7A',
  brandSecondaryText: '#E9D5FF',
  accentWarm: '#FBBF24',
  accentCool: '#2DD4BF',
  success: '#4ADE80',

  textDark: '#F5EEF8',
  textMuted: '#B8A4C8',
  textStrong: '#FFFFFF',
  borderLight: '#2E1A40',
  borderStrong: '#6B3A7A',
  destructive: '#FB7185',
} as const;

export type ColorPalette = typeof lightColors;

export type ResolvedColorScheme = 'light' | 'luxe' | 'pride';

const PALETTES: Record<ResolvedColorScheme, Record<keyof ColorPalette, string>> = {
  light: lightColors,
  luxe: luxeColors,
  pride: prideColors,
};

let activeScheme: ResolvedColorScheme = 'light';

/** Mutable palette selected at module load (and after appearance reload). */
export const colors: ColorPalette = { ...lightColors };

export function getActiveColorScheme(): ResolvedColorScheme {
  return activeScheme;
}

export function applyColorScheme(scheme: ResolvedColorScheme): void {
  activeScheme = scheme;
  const palette = PALETTES[scheme] ?? lightColors;
  (Object.keys(palette) as Array<keyof ColorPalette>).forEach((key) => {
    (colors as Record<keyof ColorPalette, string>)[key] = palette[key];
  });
}

export const spacing = {
  xs: 10,
  sm: 20,
  md: 32,
  lg: 44,
  xl: 56,
} as const;

export const radius = {
  card: 20,
  pill: 28,
  square: 14,
  hero: 24,
} as const;

interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

interface ShadowScale {
  card: ShadowStyle;
  hero: ShadowStyle;
}

function buildShadows(scheme: ResolvedColorScheme): ShadowScale {
  if (scheme === 'luxe') {
    return {
      card: {
        shadowColor: '#7A6A52',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 2,
      },
      hero: {
        shadowColor: '#B0894E',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 28,
        elevation: 4,
      },
    };
  }

  if (scheme === 'pride') {
    return {
      card: {
        shadowColor: '#09040F',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.38,
        shadowRadius: 18,
        elevation: 4,
      },
      hero: {
        shadowColor: '#F472B6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.24,
        shadowRadius: 28,
        elevation: 6,
      },
    };
  }

  return {
    card: {
      shadowColor: '#2D2926',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 3,
    },
    hero: {
      shadowColor: '#4A3048',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 5,
    },
  };
}

let cachedShadowScheme: ResolvedColorScheme | null = null;
let cachedShadows: ShadowScale | null = null;

function getShadows(): ShadowScale {
  if (!cachedShadows || cachedShadowScheme !== activeScheme) {
    cachedShadowScheme = activeScheme;
    cachedShadows = buildShadows(activeScheme);
  }
  return cachedShadows;
}

/** Rebuilds when the active color scheme changes (like `typography`). */
export const shadows: ShadowScale = new Proxy({} as ShadowScale, {
  get(_target, prop) {
    if (typeof prop === 'symbol' || prop === 'then') {
      return undefined;
    }
    return getShadows()[prop as keyof ShadowScale];
  },
  ownKeys() {
    return Reflect.ownKeys(getShadows());
  },
  getOwnPropertyDescriptor(_target, prop) {
    return Object.getOwnPropertyDescriptor(getShadows(), prop);
  },
  has(_target, prop) {
    return prop in getShadows();
  },
});

export const metrics = {
  touchTargetMin: 44,
} as const;

export type ColorToken = keyof ColorPalette;
export type SpacingToken = keyof typeof spacing;
