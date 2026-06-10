import { StyleSheet } from 'react-native';

import { SettingsScreenShell } from '@/components/settings';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/theme';

export default function AboutSettingsScreen() {
  return (
    <SettingsScreenShell title="About" subtitle="Tune — movement, nutrition, reflection.">
      <Card style={styles.card}>
        <Text variant="h2">Tune</Text>
        <Text variant="bodyMuted">Version 1.0.0</Text>
        <Text variant="bodyMuted" style={styles.copy}>
          A local-first wellness app for Pilates-inspired movement, thoughtful nutrition, and calm progress tracking.
        </Text>
      </Card>
      <Card style={styles.card}>
        <Text variant="bodyMuted" style={styles.copy}>
          Built offline-first. No account required. Your data stays on your device.
        </Text>
      </Card>
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  copy: {
    lineHeight: 22,
    marginTop: spacing.xs,
  },
});
