import {
  buildWorkoutStreakStats,
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateMonthlyCompletion,
} from '../streaks';

describe('workout streaks', () => {
  it('calculates current streak from consecutive days', () => {
    expect(calculateCurrentStreak(['2026-06-08', '2026-06-09'], '2026-06-09')).toBe(2);
  });

  it('calculates longest streak', () => {
    expect(calculateLongestStreak(['2026-06-01', '2026-06-02', '2026-06-04', '2026-06-05'])).toBe(2);
  });

  it('calculates monthly completion', () => {
    const result = calculateMonthlyCompletion(
      ['2026-06-01', '2026-06-03'],
      ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04'],
      '2026-06',
    );
    expect(result.percent).toBe(50);
  });

  it('builds full stats object', () => {
    const stats = buildWorkoutStreakStats(['2026-06-08', '2026-06-09'], ['2026-06-08', '2026-06-09'], '2026-06');
    expect(stats.monthlyCompletionPercent).toBeGreaterThanOrEqual(0);
  });
});
