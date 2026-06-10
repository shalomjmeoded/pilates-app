export const MIGRATION_002 = `
CREATE TABLE IF NOT EXISTS nutrition_daily_totals (
  meal_date TEXT PRIMARY KEY,
  calories_consumed REAL NOT NULL DEFAULT 0,
  protein_g REAL NOT NULL DEFAULT 0,
  carbs_g REAL NOT NULL DEFAULT 0,
  fat_g REAL NOT NULL DEFAULT 0,
  fiber_g REAL NOT NULL DEFAULT 0,
  meal_count INTEGER NOT NULL DEFAULT 0,
  nutrition_score INTEGER NOT NULL DEFAULT 0,
  target_calories INTEGER NOT NULL DEFAULT 0,
  target_protein_g REAL NOT NULL DEFAULT 0,
  target_carbs_g REAL NOT NULL DEFAULT 0,
  target_fat_g REAL NOT NULL DEFAULT 0,
  target_fiber_g REAL NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_nutrition_daily_totals_date ON nutrition_daily_totals(meal_date);
`;
