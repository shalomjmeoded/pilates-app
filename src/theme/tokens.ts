/** UX-1 wellness palette — premium, mature, non-aggressive. */
export const colors = {
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
  illustrationBg: '#EDE4DF',

  brandPrimary: '#4A3048',
  brandSecondary: '#B8898E',
  accentWarm: '#D9C8B4',
  accentCool: '#8FA68E',
  success: '#8FA68E',

  textDark: '#2D2926',
  textMuted: '#6E6764',
  borderLight: '#E5DDD6',
} as const;

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

export const shadows = {
  card: {
    shadowColor: '#2D2926',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
} as const;

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
