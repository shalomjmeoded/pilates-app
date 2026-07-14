export const MIGRATION_016 = `
ALTER TABLE exercise_library ADD COLUMN youtube_video_id TEXT;
ALTER TABLE exercise_library ADD COLUMN youtube_attribution TEXT;
`;
