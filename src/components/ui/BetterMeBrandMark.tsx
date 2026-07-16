import { Image, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius } from '@/theme';

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
      style={styles.container}
      accessible
      accessibilityRole="image"
      accessibilityLabel={showDescriptor ? 'BetterMe: Pilates Coach' : 'BetterMe'}
    >
      <Image
        source={BETTERME_ICON}
        resizeMode="cover"
        style={[styles.icon, { width: size, height: size }]}
      />
      {showWordmark ? (
        <View style={styles.wordmarkStack}>
          <Text variant="label" style={[styles.wordmark, compact && styles.wordmarkCompact]}>
            {showDescriptor ? 'BetterMe:' : 'BetterMe'}
          </Text>
          {showDescriptor ? (
            <Text variant="caption" style={styles.descriptor} numberOfLines={1}>
              Pilates Coach
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 0,
  },
  icon: {
    borderRadius: radius.square,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceHero,
  },
  wordmark: {
    color: colors.brandPrimary,
  },
  wordmarkStack: {
    flexShrink: 1,
    gap: 0,
  },
  wordmarkCompact: {
    fontSize: 11,
    lineHeight: 13,
  },
  descriptor: {
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 0,
  },
});
