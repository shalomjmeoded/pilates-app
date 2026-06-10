export const MIGRATION_011 = `
CREATE TABLE IF NOT EXISTS physique_assessments (
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
);

CREATE INDEX IF NOT EXISTS idx_physique_assessments_at ON physique_assessments(assessed_at DESC);
`;
