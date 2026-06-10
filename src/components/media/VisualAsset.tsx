import type { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius } from '@/theme';

export type VisualAssetIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type VisualAssetFallback = 'icon' | 'hidden';

export interface VisualAssetProps {
  image?: ImageSourcePropType | null;
  gif?: ImageSourcePropType | null;
  /** When true, prefers `gif` over `image` if both exist. */
  preferGif?: boolean;
  icon?: VisualAssetIconName;
  fallback?: VisualAssetFallback;
  size?: number;
  fillWidth?: boolean;
  fillHeight?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function VisualAsset({
  image,
  gif,
  preferGif = false,
  icon = 'image-outline',
  fallback = 'icon',
  size = 120,
  fillWidth = false,
  fillHeight = 240,
  accessibilityLabel,
  style,
}: VisualAssetProps) {
  const source = preferGif ? gif ?? image : image ?? gif;

  if (source) {
    const frameStyle = fillWidth
      ? { width: '100%' as const, height: fillHeight, borderRadius: radius.card }
      : { width: size, height: size, borderRadius: size > 100 ? radius.card : radius.square };

    return (
      <View style={[styles.frame, frameStyle, style]}>
        <Image
          source={source}
          style={fillWidth ? styles.fillImage : { width: size, height: size }}
          resizeMode="cover"
          accessibilityLabel={accessibilityLabel}
        />
      </View>
    );
  }

  if (fallback === 'hidden') {
    return null;
  }

  const iconSize = Math.max(22, Math.round((fillWidth ? 72 : size) * 0.36));
  const frameStyle = fillWidth
    ? { width: '100%' as const, height: fillHeight, borderRadius: radius.card }
    : { width: size, height: size, borderRadius: size > 100 ? radius.card : radius.square };

  return (
    <View style={[styles.frame, styles.iconFrame, frameStyle, style]} accessibilityLabel={accessibilityLabel}>
      <MaterialCommunityIcons name={icon} size={iconSize} color={colors.brandSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.surfaceRose,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFrame: {
    backgroundColor: colors.surfaceCanvas,
  },
  fillImage: {
    width: '100%',
    height: '100%',
  },
});
