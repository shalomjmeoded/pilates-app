export const MIGRATION_010 = `
CREATE TABLE IF NOT EXISTS ai_usage (
  id TEXT PRIMARY KEY NOT NULL,
  feature TEXT NOT NULL,
  period_key TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  last_request_at TEXT NOT NULL,
  last_prompt_hash TEXT,
  UNIQUE(feature, period_key)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_last_request ON ai_usage(last_request_at DESC);
`;
