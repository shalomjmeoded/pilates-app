export const MIGRATION_003 = `
CREATE TABLE IF NOT EXISTS user_milestones (
  id TEXT PRIMARY KEY,
  milestone_key TEXT NOT NULL UNIQUE,
  unlocked_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS body_measurements (
  id TEXT PRIMARY KEY,
  measured_at TEXT NOT NULL,
  waist_cm REAL,
  hips_cm REAL,
  chest_cm REAL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_body_measurements_at ON body_measurements(measured_at);

CREATE TABLE IF NOT EXISTS progress_photos (
  id TEXT PRIMARY KEY,
  captured_at TEXT NOT NULL,
  uri TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_progress_photos_at ON progress_photos(captured_at);

CREATE TABLE IF NOT EXISTS progress_analytics_snapshots (
  id TEXT PRIMARY KEY,
  snapshot_date TEXT NOT NULL UNIQUE,
  consistency_score INTEGER NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;
