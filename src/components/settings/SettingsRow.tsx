import { Pressable, StyleSheet, View } from 'react-native';

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
      {showChevron && onPress ? <Text variant="bodyMuted">›</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
  },
  pressed: {
    opacity: 0.85,
  },
  content: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.xs,
  },
  destructive: {
    color: colors.brandPrimary,
  },
});
