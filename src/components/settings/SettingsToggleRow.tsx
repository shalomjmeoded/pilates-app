import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

interface SettingsToggleRowProps {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
}

export function SettingsToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: SettingsToggleRowProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      onPress={onToggle}
      style={[styles.row, enabled && styles.rowEnabled]}
    >
      <Text variant="body">{label}</Text>
      {description ? <Text variant="bodyMuted">{description}</Text> : null}
      <Text variant="label" style={enabled ? styles.on : styles.off}>
        {enabled ? 'On' : 'Off'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    gap: 4,
  },
  rowEnabled: {
    borderColor: colors.brandPrimary,
  },
  on: {
    color: colors.brandPrimary,
    marginTop: spacing.xs,
  },
  off: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
