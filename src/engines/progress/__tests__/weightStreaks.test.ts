import { calculateWeightStreakStats } from '../weightStreaks';
import { buildWeightTrendAverages } from '../weightTrends';

describe('calculateWeightStreakStats', () => {
  it('returns zero for empty logs', () => {
    expect(calculateWeightStreakStats([])).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  it('counts consecutive days', () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const stats = calculateWeightStreakStats([yesterday, today]);
    expect(stats.currentStreak).toBeGreaterThanOrEqual(1);
  });
});

describe('buildWeightTrendAverages', () => {
  it('averages recent logs', () => {
    const averages = buildWeightTrendAverages([
      { id: '1', loggedAt: new Date().toISOString(), weightKg: 70 },
      { id: '2', loggedAt: new Date().toISOString(), weightKg: 68 },
    ]);
    expect(averages.weeklyAverageKg).toBe(69);
  });
});
