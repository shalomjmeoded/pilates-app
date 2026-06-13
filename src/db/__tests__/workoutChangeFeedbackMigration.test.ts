import { MIGRATIONS } from '@/db/migrations';

describe('workout change feedback migration', () => {
  it('registers migration 12 with workout_change_feedback table', () => {
    const migration = MIGRATIONS.find((entry) => entry.version === 12);
    expect(migration).toBeDefined();
    expect(migration?.sql).toContain('CREATE TABLE IF NOT EXISTS workout_change_feedback');
    expect(migration?.sql).toContain('week_start TEXT NOT NULL UNIQUE');
  });

  it('registers migration 13 with workout_change_events table', () => {
    const migration = MIGRATIONS.find((entry) => entry.version === 13);
    expect(migration).toBeDefined();
    expect(migration?.sql).toContain('CREATE TABLE IF NOT EXISTS workout_change_events');
    expect(migration?.sql).toContain('event_date TEXT NOT NULL');
  });
});
