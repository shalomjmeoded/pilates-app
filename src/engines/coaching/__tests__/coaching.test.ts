import { buildCoachingInsights } from '../buildCoachingInsights';

describe('buildCoachingInsights', () => {
  it('suggests protein when adherence is low', () => {
    const insight = buildCoachingInsights({
      nutritionRows: [
        {
          mealDate: '2026-06-09',
          caloriesConsumed: 1800,
          proteinG: 60,
          carbsG: 180,
          fatG: 60,
          fiberG: 20,
          mealCount: 2,
          nutritionScore: 70,
          targetCalories: 2000,
          targetProteinG: 120,
          targetCarbsG: 200,
          targetFatG: 65,
          targetFiberG: 28,
          updatedAt: '2026-06-09',
        },
      ],
      completedWorkoutsThisWeek: 1,
      weightLogs: [],
    });
    expect(insight.dailyTip).toContain('protein');
  });

  it('suggests weight logging after gap', () => {
    const insight = buildCoachingInsights({
      nutritionRows: [],
      completedWorkoutsThisWeek: 0,
      weightLogs: [{ id: '1', loggedAt: '2026-05-01T00:00:00.000Z', weightKg: 68 }],
    });
    expect(insight.dailyTip.toLowerCase()).toContain('weight');
  });

  it('praises consistency with 3+ workouts', () => {
    const insight = buildCoachingInsights({
      nutritionRows: [],
      completedWorkoutsThisWeek: 3,
      weightLogs: [{ id: '1', loggedAt: new Date().toISOString(), weightKg: 68 }],
    });
    expect(insight.dailyTip.toLowerCase()).toContain('consistency');
  });
});
