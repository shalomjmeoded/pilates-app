import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';

interface EncouragementBannerProps {
  title: string;
  body?: string;
  onDismiss?: () => void;
}

export function EncouragementBanner({ title, body, onDismiss }: EncouragementBannerProps) {
  return (
    <View style={styles.banner} accessibilityRole="summary">
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
    </View>
  );
}

const styles = StyleSheet.create({
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
});
