export const MIGRATION_009 = `
ALTER TABLE exercise_library ADD COLUMN session_role TEXT NOT NULL DEFAULT 'main';
`;
