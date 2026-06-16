import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  accentColor?: string;
}

export function SettingsRow({
  label,
  value,
  onPress,
  showChevron = Boolean(onPress),
  destructive = false,
  accentColor,
}: SettingsRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null]}
    >
      {accentColor ? <View style={[styles.accent, { backgroundColor: accentColor }]} /> : null}
      <View style={styles.content}>
        <Text variant="body" style={destructive ? styles.destructive : undefined}>
          {label}
        </Text>
        {value ? <Text variant="bodyMuted">{value}</Text> : null}
      </View>
      {showChevron && onPress ? (
        <View style={styles.chevronWrap}>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.square,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.992 }],
  },
  content: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.xs,
  },
  destructive: {
    color: colors.destructive,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
});
