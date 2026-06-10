import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { SettingsScreenShell } from '@/components/settings';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { exportDataViaShareSheet } from '@/services/export/exportData';
import { spacing } from '@/theme';

export default function DataSettingsScreen() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      await exportDataViaShareSheet();
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SettingsScreenShell title="Data" subtitle="Export and manage your local history.">
      <Card style={styles.card}>
        <Text variant="h2">Export data</Text>
        <Text variant="bodyMuted" style={styles.copy}>
          Export profile, weight logs, meals, workouts, nutrition targets, milestones, and reminders as JSON via the share sheet.
        </Text>
        <Button label={isExporting ? 'Preparing...' : 'Export JSON'} onPress={() => void handleExport()} disabled={isExporting} />
        {error ? <Text variant="body" style={styles.error}>{error}</Text> : null}
      </Card>

      <Card style={styles.card}>
        <Text variant="h2">Import data</Text>
        <Text variant="bodyMuted" style={styles.copy}>
          Import is not available yet. Architecture is reserved for a future release.
        </Text>
      </Card>
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  copy: {
    lineHeight: 22,
  },
  error: {
    color: '#C97A87',
  },
});
