import { useCallback, useEffect, useState } from 'react';
import { DevSettings, ScrollView, StyleSheet } from 'react-native';

import { SettingsScreenShell } from '@/components/settings';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { getDatabase, resetDatabaseForDev } from '@/db/connection';
import { MIGRATIONS } from '@/db/migrations';
import { getSchemaDiagnostics, type SchemaDiagnostics } from '@/db/schemaDiagnostics';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { spacing } from '@/theme';

interface AuditRow {
  changed_at: string;
  setting_key: string;
  old_value: string | null;
  new_value: string | null;
}

export default function DevAuditScreen() {
  const storageBackend = usePreferencesStore((state) => state.preferences.storageBackend);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [schema, setSchema] = useState<SchemaDiagnostics | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const reload = useCallback(async () => {
    const db = await getDatabase();
    const [audit, diagnostics] = await Promise.all([
      db.getAllAsync<AuditRow>(
        'SELECT changed_at, setting_key, old_value, new_value FROM settings_audit_log ORDER BY changed_at DESC LIMIT 50',
      ),
      getSchemaDiagnostics(db),
    ]);
    setRows(audit);
    setSchema(diagnostics);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      await resetDatabaseForDev();
      DevSettings.reload();
    } finally {
      setIsResetting(false);
    }
  };

  if (!__DEV__) {
    return (
      <SettingsScreenShell title="Developer audit">
        <Text variant="bodyMuted">Available in development builds only.</Text>
      </SettingsScreenShell>
    );
  }

  return (
    <SettingsScreenShell title="Developer audit" subtitle="Local diagnostics for debugging.">
      <Card style={styles.card}>
        <Text variant="h2">Storage</Text>
        <Text variant="body">SQLite: Active</Text>
        <Text variant="body">MMKV: {storageBackend === 'mmkv' ? 'Active' : 'Fallback active'}</Text>
        <Text variant="body">Migrations: v{MIGRATIONS[MIGRATIONS.length - 1]?.version ?? 0}</Text>
        {schema ? (
          <>
            <Text variant="body">Applied: {schema.appliedVersions.join(', ') || 'none'}</Text>
            <Text variant="body">
              ai_usage: {schema.tables.includes('ai_usage') ? 'ok' : 'MISSING'}
            </Text>
            <Text variant="body">
              physique_assessments:{' '}
              {schema.tables.includes('physique_assessments') ? 'ok' : 'MISSING'}
            </Text>
          </>
        ) : null}
        <Button
          label={isResetting ? 'Resetting...' : 'Reset local database'}
          variant="secondary"
          onPress={() => void handleResetDatabase()}
          disabled={isResetting}
        />
      </Card>

      <Text variant="h2">Recent settings changes</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {rows.map((row, index) => (
          <Card key={`${row.changed_at}-${index}`} style={styles.card}>
            <Text variant="label">{row.setting_key}</Text>
            <Text variant="bodyMuted">{row.changed_at}</Text>
            <Text variant="bodyMuted" numberOfLines={2}>Old: {row.old_value ?? '—'}</Text>
            <Text variant="bodyMuted" numberOfLines={2}>New: {row.new_value ?? '—'}</Text>
          </Card>
        ))}
      </ScrollView>
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  list: { gap: spacing.sm, paddingBottom: spacing.lg },
});
