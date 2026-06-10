export const MIGRATION_006 = `
CREATE TABLE IF NOT EXISTS app_preferences (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;
