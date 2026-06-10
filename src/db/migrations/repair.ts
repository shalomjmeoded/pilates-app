import { MIGRATION_010 } from './010_ai_usage';
import { MIGRATION_011 } from './011_physique_assessments';

export const REPAIRABLE_TABLES = ['ai_usage', 'physique_assessments'] as const;

export type RepairableTable = (typeof REPAIRABLE_TABLES)[number];

/** One statement per entry — expo-sqlite DDL is most reliable via runAsync/execAsync per statement. */
export const REPAIRABLE_DDL_STATEMENTS: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS ai_usage (
  id TEXT PRIMARY KEY NOT NULL,
  feature TEXT NOT NULL,
  period_key TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  last_request_at TEXT NOT NULL,
  last_prompt_hash TEXT,
  UNIQUE(feature, period_key)
)`,
  'CREATE INDEX IF NOT EXISTS idx_ai_usage_last_request ON ai_usage(last_request_at DESC)',
  `CREATE TABLE IF NOT EXISTS physique_assessments (
  id TEXT PRIMARY KEY NOT NULL,
  assessed_at TEXT NOT NULL,
  physique_category TEXT NOT NULL,
  body_fat_min_percent INTEGER NOT NULL,
  body_fat_max_percent INTEGER NOT NULL,
  confidence TEXT NOT NULL,
  nutrition_suggestion TEXT NOT NULL,
  workout_suggestion TEXT NOT NULL,
  notes TEXT,
  disclaimer_accepted_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
  'CREATE INDEX IF NOT EXISTS idx_physique_assessments_at ON physique_assessments(assessed_at DESC)',
] as const;

/** @deprecated Use REPAIRABLE_DDL_STATEMENTS */
export const REPAIRABLE_MIGRATION_SQL = [MIGRATION_010, MIGRATION_011].join('\n');
