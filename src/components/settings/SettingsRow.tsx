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
}

export function SettingsRow({
  label,
  value,
  onPress,
  showChevron = Boolean(onPress),
  destructive = false,
}: SettingsRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null]}
    >
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
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
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
