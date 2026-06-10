import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { colors, radius } from '@/theme';

interface ExerciseIllustrationProps {
  muscleGroup: string;
  size?: number;
}

type IllustrationVariant = 'core' | 'lower' | 'upper' | 'full';

function resolveVariant(muscleGroup: string): IllustrationVariant {
  const group = muscleGroup.toLowerCase();
  if (group.includes('core') || group.includes('back')) {
    return 'core';
  }
  if (
    group.includes('glute') ||
    group.includes('quad') ||
    group.includes('hamstring') ||
    group.includes('thigh') ||
    group.includes('hip')
  ) {
    return 'lower';
  }
  if (group.includes('shoulder') || group.includes('arm')) {
    return 'upper';
  }
  return 'full';
}

function Figure({ variant }: { variant: IllustrationVariant }) {
  const stroke = colors.brandPrimary;
  const fill = colors.accentWarm;

  if (variant === 'core') {
    return (
      <>
        <Circle cx="60" cy="22" r="10" stroke={stroke} strokeWidth="2" fill={colors.surfaceRose} />
        <Path d="M60 32 L60 58" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M44 42 L76 42" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M48 58 L60 78 L72 58" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Ellipse cx="60" cy="50" rx="10" ry="7" fill={fill} opacity="0.35" />
      </>
    );
  }

  if (variant === 'lower') {
    return (
      <>
        <Circle cx="60" cy="18" r="9" stroke={stroke} strokeWidth="2" fill={colors.surfaceRose} />
        <Path d="M60 27 L60 50" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M48 38 L72 38" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <Path d="M52 50 L46 82 M68 50 L74 82" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        <Ellipse cx="60" cy="56" rx="12" ry="8" fill={fill} opacity="0.35" />
      </>
    );
  }

  if (variant === 'upper') {
    return (
      <>
        <Circle cx="60" cy="24" r="10" stroke={stroke} strokeWidth="2" fill={colors.surfaceRose} />
        <Path d="M60 34 L60 72" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M38 44 L82 44" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M60 72 L48 92 M60 72 L72 92" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        <Ellipse cx="60" cy="44" rx="14" ry="6" fill={fill} opacity="0.3" />
      </>
    );
  }

  return (
    <>
      <Circle cx="60" cy="20" r="10" stroke={stroke} strokeWidth="2" fill={colors.surfaceRose} />
      <Path d="M60 30 L60 54" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M42 40 L78 40" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M52 54 L44 88 M68 54 L76 88" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M44 88 L52 94 M76 88 L68 94" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <Ellipse cx="60" cy="48" rx="11" ry="8" fill={fill} opacity="0.28" />
    </>
  );
}

export function ExerciseIllustration({ muscleGroup, size = 120 }: ExerciseIllustrationProps) {
  const variant = resolveVariant(muscleGroup);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size > 100 ? radius.card : radius.square,
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx="60" cy="60" r="52" fill={colors.illustrationBg} />
        <Figure variant={variant} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.illustrationBg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
