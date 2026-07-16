import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, radius, spacing, createDynamicStyles } from '@/theme';
import { Text } from './Text';

interface EncouragementBannerProps {
  title: string;
  body?: string;
  onDismiss?: () => void;
}

export function EncouragementBanner({ title, body, onDismiss }: EncouragementBannerProps) {
  useEffect(() => {
    if (!onDismiss) {
      return undefined;
    }
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss, title]);

  return (
    <Animated.View entering={FadeInDown.duration(240)} style={styles.banner} accessibilityRole="summary">
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="check-circle-outline" size={20} color={colors.success} />
      </View>
      <View style={styles.copy}>
        <Text variant="label" style={styles.title}>
          {title}
        </Text>
        {body ? (
          <Text variant="caption" style={styles.body} numberOfLines={2}>
            {body}
          </Text>
        ) : null}
      </View>
      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss encouragement"
          onPress={onDismiss}
          hitSlop={8}
          style={({ pressed }) => [styles.dismiss, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = createDynamicStyles(() => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: '#C9D8C8',
    backgroundColor: '#F0F6EE',
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCanvas,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.textStrong,
  },
  body: {
    color: colors.textMuted,
  },
  dismiss: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
}));
