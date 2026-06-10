import type { SQLiteDatabase } from 'expo-sqlite';

import { MIGRATIONS } from '@/db/migrations';
import { REPAIRABLE_TABLES } from '@/db/migrations/repair';

export interface SchemaDiagnostics {
  appliedVersions: number[];
  latestMigrationVersion: number;
  tables: string[];
  missingRepairableTables: string[];
}

export async function getSchemaDiagnostics(db: SQLiteDatabase): Promise<SchemaDiagnostics> {
  const versionRows = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC',
  );
  const tableRows = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC",
  );
  const tables = tableRows.map((row) => row.name);

  return {
    appliedVersions: versionRows.map((row) => row.version),
    latestMigrationVersion: MIGRATIONS[MIGRATIONS.length - 1]?.version ?? 0,
    tables,
    missingRepairableTables: REPAIRABLE_TABLES.filter((table) => !tables.includes(table)),
  };
}
