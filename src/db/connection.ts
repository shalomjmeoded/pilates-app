import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { ensureAiSchema } from '@/db/ensureAiSchema';
import { MIGRATIONS } from './migrations';

const DATABASE_NAME = 'tune.db';

let databaseInstance: SQLiteDatabase | null = null;
let databaseInitPromise: Promise<SQLiteDatabase> | null = null;

const IGNORABLE_MIGRATION_ERRORS = ['duplicate column name', 'already exists'];

async function getAppliedVersions(db: SQLiteDatabase): Promise<Set<number>> {
  const table = await db.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'",
  );

  if (!table) {
    return new Set();
  }

  const rows = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC',
  );
  return new Set(rows.map((row) => row.version));
}

/** Schema DDL — always execAsync, never runAsync/prepare. */
async function execSchemaSql(db: SQLiteDatabase, sql: string): Promise<void> {
  const statements = sql
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

  for (const statement of statements) {
    try {
      await db.execAsync(`${statement};`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (IGNORABLE_MIGRATION_ERRORS.some((fragment) => message.includes(fragment))) {
        continue;
      }
      throw error;
    }
  }
}

async function runMigrations(db: SQLiteDatabase): Promise<void> {
  let applied = await getAppliedVersions(db);

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.version)) {
      continue;
    }

    await execSchemaSql(db, migration.sql);
    await db.runAsync('INSERT INTO schema_migrations (version) VALUES (?)', migration.version);
    applied.add(migration.version);
  }

  await ensureAiSchema(db);
}

async function openAndMigrate(): Promise<SQLiteDatabase> {
  const db = await openDatabaseAsync(DATABASE_NAME);
  await runMigrations(db);
  databaseInstance = db;
  return db;
}

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (databaseInstance) {
    return databaseInstance;
  }

  if (!databaseInitPromise) {
    databaseInitPromise = openAndMigrate().catch((error) => {
      databaseInitPromise = null;
      databaseInstance = null;
      throw error;
    });
  }

  return databaseInitPromise;
}

export async function resetDatabaseForDev(): Promise<void> {
  if (databaseInstance) {
    await databaseInstance.closeAsync();
  }

  databaseInstance = null;
  databaseInitPromise = null;

  const db = await openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('DROP TABLE IF EXISTS schema_migrations;');
  const tables = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
  );

  for (const table of tables) {
    await db.execAsync(`DROP TABLE IF EXISTS ${table.name};`);
  }

  await db.closeAsync();
}
