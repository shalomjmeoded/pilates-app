import type { SQLiteDatabase } from 'expo-sqlite';

import { REPAIRABLE_DDL_STATEMENTS, REPAIRABLE_TABLES } from '@/db/migrations/repair';

async function listTableNames(db: SQLiteDatabase): Promise<Set<string>> {
  const rows = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table'",
  );
  return new Set(rows.map((row) => row.name));
}

/** DDL must use execAsync — runAsync/prepareAsync does not reliably create tables in expo-sqlite. */
export async function ensureAiSchema(db: SQLiteDatabase): Promise<void> {
  for (const statement of REPAIRABLE_DDL_STATEMENTS) {
    await db.execAsync(`${statement.trim()};`);
  }

  const tables = await listTableNames(db);
  const missing = REPAIRABLE_TABLES.filter((name) => !tables.has(name));
  if (missing.length > 0) {
    throw new Error(
      `Failed to initialize AI tables (${missing.join(', ')}). Reset the app database from Settings → Developer audit.`,
    );
  }
}
