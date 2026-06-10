import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme';

interface IllustrationProps {
  width?: number;
  height?: number;
}

export function NotificationsIllustration({ width = 200, height = 140 }: IllustrationProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 140">
      <Circle cx="100" cy="70" r="58" fill={colors.illustrationBg} />
      <Path
        d="M100 38 C86 38 78 50 78 62 L78 86 L70 94 L130 94 L122 86 L122 62 C122 50 114 38 100 38 Z"
        fill={colors.surfaceCanvas}
        stroke={colors.brandPrimary}
        strokeWidth="2.5"
      />
      <Circle cx="100" cy="102" r="6" fill={colors.accentWarm} />
      <Circle cx="132" cy="48" r="14" fill={colors.brandPrimary} opacity="0.9" />
      <Path d="M126 48 L136 48 M131 43 L131 53" stroke={colors.surfaceCanvas} strokeWidth="2" />
    </Svg>
  );
}

export function NutritionHeroIllustration({ width = 120, height = 120 }: IllustrationProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 120">
      <Circle cx="60" cy="60" r="52" fill={colors.illustrationBg} />
      <Circle cx="60" cy="60" r="28" stroke={colors.brandPrimary} strokeWidth="3" fill="none" />
      <Path d="M60 32 L60 88 M32 60 L88 60" stroke={colors.accentWarm} strokeWidth="2" opacity="0.6" />
      <Rect x="46" y="46" width="28" height="28" rx="8" fill={colors.surfaceRose} stroke={colors.brandPrimary} strokeWidth="1.5" />
    </Svg>
  );
}
