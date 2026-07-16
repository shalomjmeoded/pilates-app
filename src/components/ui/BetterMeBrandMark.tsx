import { Image, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, createDynamicStyles } from '@/theme';

const BETTERME_ICON = require('../../../assets/icon.png');

interface BetterMeBrandMarkProps {
  showWordmark?: boolean;
  compact?: boolean;
  showDescriptor?: boolean;
}

export function BetterMeBrandMark({
  showWordmark = true,
  compact = false,
  showDescriptor = false,
}: BetterMeBrandMarkProps) {
  const size = compact ? 22 : 28;

  return (
    <View
      style={[styles.container, compact && styles.containerCompact]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={showDescriptor ? 'Pilates at Home: Daily Coach' : 'Pilates at Home'}
    >
      <Image
        source={BETTERME_ICON}
        resizeMode="cover"
        style={[styles.icon, { width: size, height: size }]}
      />
      {showWordmark ? (
        <View style={[styles.wordmarkStack, compact && styles.wordmarkStackCompact]}>
          <Text
            variant="label"
            style={[styles.wordmark, compact && styles.wordmarkCompact]}
            numberOfLines={compact ? 2 : 1}
            adjustsFontSizeToFit
            minimumFontScale={0.78}
          >
            {showDescriptor ? 'Pilates at Home:' : 'Pilates at Home'}
          </Text>
          {showDescriptor ? (
            <Text variant="caption" style={styles.descriptor} numberOfLines={1}>
              Daily Coach
            </Text>
          ) : null}
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
    maxWidth: 148,
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
    maxWidth: 118,
  },
  wordmarkCompact: {
    fontSize: 10,
    lineHeight: 12,
  },
  descriptor: {
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 0,
  },
}));
