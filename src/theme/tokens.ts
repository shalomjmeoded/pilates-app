export const colors = {
  backgroundPrimary: '#F9EFEC',
  surfaceCanvas: '#FFFFFF',
  surfaceRose: '#FFF8F7',
  surfacePeach: '#FFF4EC',
  illustrationBg: '#F3E8E4',
  brandPrimary: '#C97A87',
  accentWarm: '#EAA98A',
  accentCool: '#9BB7C4',
  textDark: '#2E2A29',
  textMuted: '#7C7573',
  borderLight: '#E8DFDC',
} as const;

export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
} as const;

export const radius = {
  card: 16,
  pill: 24,
  square: 12,
} as const;

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
