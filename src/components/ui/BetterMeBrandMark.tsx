import { Image, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius } from '@/theme';

const BETTERME_ICON = require('../../../assets/icon.png');

interface BetterMeBrandMarkProps {
  showWordmark?: boolean;
  compact?: boolean;
}

export function BetterMeBrandMark({
  showWordmark = true,
  compact = false,
}: BetterMeBrandMarkProps) {
  const size = compact ? 22 : 28;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="image"
      accessibilityLabel="BetterMe"
    >
      <Image
        source={BETTERME_ICON}
        resizeMode="cover"
        style={[styles.icon, { width: size, height: size }]}
      />
      {showWordmark ? (
        <Text variant="label" style={[styles.wordmark, compact && styles.wordmarkCompact]}>
          BetterMe
        </Text>
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
  wordmarkCompact: {
    fontSize: 12,
  },
});
