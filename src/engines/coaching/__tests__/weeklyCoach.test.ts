import { buildLocalWeeklyCoachFallback } from '../buildLocalWeeklyCoachFallback';
import { buildWeeklyCoachSummary } from '../buildWeeklyCoachSummary';
import { computeWeeklyCoachReadiness } from '../weeklyCoachReadiness';
import { getWeekStartDate } from '../weekStart';

describe('weekly coach engines', () => {
  it('builds summary-only weekly input without meal history', () => {
    const summary = buildWeeklyCoachSummary({
      nutritionRows: [
        {
          mealDate: '2026-06-09',
          caloriesConsumed: 1700,
          proteinG: 90,
          carbsG: 180,
          fatG: 55,
          fiberG: 20,
          mealCount: 3,
          nutritionScore: 75,
          targetCalories: 2000,
          targetProteinG: 120,
          targetCarbsG: 200,
          targetFatG: 65,
          targetFiberG: 28,
          updatedAt: '2026-06-09',
        },
      ],
      workoutsCompleted: 4,
      workoutsPlanned: 5,
      weightLogs: [
        { id: '1', loggedAt: '2026-06-01T00:00:00.000Z', weightKg: 70 },
        { id: '2', loggedAt: '2026-06-08T00:00:00.000Z', weightKg: 69.5 },
      ],
      skippedExerciseNames: ['Jump Squat'],
      goal: 'get_toned',
      referenceDate: new Date('2026-06-09T12:00:00.000Z'),
    });

    expect(summary.weekStart).toBe(getWeekStartDate(new Date('2026-06-09T12:00:00.000Z')));
    expect(summary.workoutsCompleted).toBe(4);
    expect(summary.topSkippedExerciseNames).toEqual(['Jump Squat']);
    expect(summary).not.toHaveProperty('meals');
  });

  it('uses local fallback when AI is unavailable', () => {
    const fallback = buildLocalWeeklyCoachFallback({
      weekStart: '2026-06-02',
      workoutsCompleted: 1,
      workoutsPlanned: 4,
      calorieAdherencePercent: 60,
      proteinAdherencePercent: 55,
      weightTrend: 'stable',
      skippedExerciseCount: 2,
      topSkippedExerciseNames: ['Lunge'],
      goal: 'maintain',
    });

    expect(fallback.source).toBe('local');
    expect(fallback.summary.length).toBeGreaterThan(0);
    expect(fallback.wins.length).toBeGreaterThan(0);
    expect(fallback.nutritionTip.length).toBeGreaterThan(0);
    expect(fallback.weightTip.length).toBeGreaterThan(0);
    expect(fallback.workoutTip.length).toBeGreaterThan(0);
  });

  it('unlocks weekly coach at 70% composite logging', () => {
    const locked = computeWeeklyCoachReadiness({
      reviewWeekStart: '2026-06-02',
      reviewWeekEnd: '2026-06-08',
      weightLogs: [{ id: '1', loggedAt: '2026-06-02T08:00:00.000Z', weightKg: 70 }],
      nutritionRows: [
        {
          mealDate: '2026-06-02',
          caloriesConsumed: 1800,
          proteinG: 90,
          carbsG: 180,
          fatG: 55,
          fiberG: 20,
          mealCount: 3,
          nutritionScore: 70,
          targetCalories: 2000,
          targetProteinG: 120,
          targetCarbsG: 200,
          targetFatG: 65,
          targetFiberG: 28,
          updatedAt: '2026-06-02',
        },
      ],
      workoutsCompleted: 1,
      workoutsPlanned: 4,
    });
    expect(locked.unlocked).toBe(false);

    const unlocked = computeWeeklyCoachReadiness({
      reviewWeekStart: '2026-06-02',
      reviewWeekEnd: '2026-06-08',
      weightLogs: [2, 3, 4, 5, 6].map((day) => ({
        id: String(day),
        loggedAt: `2026-06-0${day}T08:00:00.000Z`,
        weightKg: 70,
      })),
      nutritionRows: [2, 3, 4, 5, 6].map((day) => ({
        mealDate: `2026-06-0${day}`,
        caloriesConsumed: 1800,
        proteinG: 90,
        carbsG: 180,
        fatG: 55,
        fiberG: 20,
        mealCount: 3,
        nutritionScore: 70,
        targetCalories: 2000,
        targetProteinG: 120,
        targetCarbsG: 200,
        targetFatG: 65,
        targetFiberG: 28,
        updatedAt: `2026-06-0${day}`,
      })),
      workoutsCompleted: 3,
      workoutsPlanned: 4,
    });
    expect(unlocked.overallPercent).toBeGreaterThanOrEqual(70);
    expect(unlocked.unlocked).toBe(true);
  });
});
