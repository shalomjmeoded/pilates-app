jest.mock('@/db/repositories/aiOutputRepository', () => ({
  logAiOutput: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/db/repositories/aiUsageRepository', () => ({
  recordAiUsage: jest.fn().mockResolvedValue(undefined),
  getAiUsageCount: jest.fn().mockResolvedValue(0),
  getQuotaPeriodKey: jest.fn().mockReturnValue('2026-06-09'),
}));

import { MockAiProvider } from '../providers/MockAiProvider';

describe('MockAiProvider', () => {
  it('returns a meal estimate for text descriptions', async () => {
    const provider = new MockAiProvider();
    const estimate = await provider.estimateMealFromText('Greek yogurt with berries');

    expect(estimate.mealTitle).toContain('Greek yogurt');
    expect(estimate.calories).toBeGreaterThan(0);
    expect(estimate.carbsG).toBeGreaterThan(0);
  });

  it('returns weekly coach insight from summary aggregates', async () => {
    const provider = new MockAiProvider();
    const insight = await provider.generateWeeklyCoach({
      weekStart: '2026-06-02',
      workoutsCompleted: 3,
      workoutsPlanned: 4,
      calorieAdherencePercent: 82,
      proteinAdherencePercent: 78,
      weightTrend: 'stable',
      skippedExerciseCount: 0,
      topSkippedExerciseNames: [],
      goal: 'maintain',
    });

    expect(insight.summary.length).toBeGreaterThan(0);
    expect(insight.wins.length).toBeGreaterThan(0);
    expect(insight.focusForNextWeek.length).toBeGreaterThan(0);
  });

  it('returns a substitution id from the library list', async () => {
    const provider = new MockAiProvider();
    const result = await provider.substituteExercise({
      exerciseId: 'a',
      exerciseName: 'Squat',
      muscleGroup: 'quadriceps',
      libraryExerciseIds: ['a', 'b', 'c'],
      swapReason: 'too_hard',
    });

    expect(['a', 'b', 'c']).toContain(result.replacementExerciseId);
    expect(result.reason.length).toBeGreaterThan(0);
    expect(result.coachingNote.length).toBeGreaterThan(0);
  });
});
