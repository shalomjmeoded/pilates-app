import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Image,
  type ImageResizeMode,
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
  animateFrames?: boolean;
  icon?: VisualAssetIconName;
  fallback?: VisualAssetFallback;
  size?: number;
  fillWidth?: boolean;
  fillHeight?: number;
  resizeMode?: ImageResizeMode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function VisualAsset({
  image,
  gif,
  preferGif = false,
  animateFrames = false,
  icon = 'image-outline',
  fallback = 'icon',
  size = 120,
  fillWidth = false,
  fillHeight = 240,
  resizeMode = 'cover',
  accessibilityLabel,
  style,
}: VisualAssetProps) {
  const frames = useMemo(() => {
    if (!animateFrames || !image || !gif || image === gif) {
      return null;
    }
    return [image, gif] as const;
  }, [animateFrames, gif, image]);
  const [frameIndex, setFrameIndex] = useState(0);
  const source = frames ? frames[frameIndex] : preferGif ? gif ?? image : image ?? gif;

  useEffect(() => {
    if (!frames) {
      setFrameIndex(0);
      return undefined;
    }

    setFrameIndex(0);
    const interval = setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length);
    }, 850);

    return () => clearInterval(interval);
  }, [frames]);

  if (source) {
    const frameStyle = fillWidth
      ? { width: '100%' as const, height: fillHeight, borderRadius: radius.card }
      : { width: size, height: size, borderRadius: size > 100 ? radius.card : radius.square };

    return (
      <View style={[styles.frame, frameStyle, style]}>
        <Image
          key={frames ? frameIndex : undefined}
          source={source}
          style={fillWidth ? styles.fillImage : { width: size, height: size }}
          resizeMode={resizeMode}
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
