import { Image, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, createDynamicStyles } from '@/theme';

const APP_ICON = require('../../../assets/icon.png');

interface BetterMeBrandMarkProps {
  showWordmark?: boolean;
  compact?: boolean;
}

export function BetterMeBrandMark({
  showWordmark = true,
  compact = false,
}: BetterMeBrandMarkProps) {
  const size = compact ? 26 : 28;

  return (
    <View
      style={[styles.container, compact && styles.containerCompact]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Form: Pilates Studio"
    >
      <Image
        source={APP_ICON}
        resizeMode="cover"
        style={[styles.icon, { width: size, height: size }]}
      />
      {showWordmark ? (
        <View style={[styles.wordmarkStack, compact && styles.wordmarkStackCompact]}>
          <Text
            variant="label"
            style={[styles.wordmark, compact && styles.wordmarkCompact]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.9}
          >
            Form: Pilates Studio
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 1,
    minWidth: 0,
  },
  containerCompact: {
    maxWidth: 150,
  },
  icon: {
    borderRadius: radius.square,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceHero,
    flexShrink: 0,
  },
  wordmark: {
    color: colors.brandPrimary,
  },
  wordmarkStack: {
    flexShrink: 1,
    minWidth: 0,
    gap: 0,
  },
  wordmarkStackCompact: {
    maxWidth: 116,
  },
  wordmarkCompact: {
    fontSize: 13,
    lineHeight: 17,
  },
}));
