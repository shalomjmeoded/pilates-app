import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

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
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 28,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
    paddingHorizontal: 10,
  },
  accent: {
    width: 18,
    height: 3,
    borderRadius: 999,
  },
  title: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  group: {
    gap: 8,
  },
});
