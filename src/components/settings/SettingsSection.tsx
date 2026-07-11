import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/theme';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
  accentColor?: string;
}

export function SettingsSection({ title, children, accentColor = colors.brandSecondary }: SettingsSectionProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <View style={[styles.accent, { backgroundColor: accentColor }]} />
        <Text variant="label" style={styles.title}>
          {title}
        </Text>
      </View>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 32,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 2,
  },
  accent: {
    width: 4,
    height: 16,
    borderRadius: 999,
  },
  title: {
    color: colors.textMuted,
    letterSpacing: 0,
  },
  group: {
    gap: 8,
  },
});
