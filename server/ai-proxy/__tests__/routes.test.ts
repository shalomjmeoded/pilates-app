import { AI_ROUTES, ROUTE_TO_FEATURE } from '../routes';

describe('ai-proxy routes', () => {
  it('maps each endpoint to a feature', () => {
    expect(ROUTE_TO_FEATURE[AI_ROUTES.mealText]).toBe('meal_text_estimate');
    expect(ROUTE_TO_FEATURE[AI_ROUTES.mealPhoto]).toBe('meal_photo_estimate');
    expect(ROUTE_TO_FEATURE[AI_ROUTES.exerciseSwap]).toBe('exercise_substitution');
    expect(ROUTE_TO_FEATURE[AI_ROUTES.workoutChange]).toBe('workout_change_suggestion');
    expect(ROUTE_TO_FEATURE[AI_ROUTES.weeklyCoach]).toBe('weekly_coach');
    expect(ROUTE_TO_FEATURE[AI_ROUTES.physiqueAssessment]).toBe('physique_assessment');
  });

  it('keeps gemini credentials out of route definitions', () => {
    const serialized = JSON.stringify(AI_ROUTES);
    expect(serialized).not.toContain('GEMINI_API_KEY');
    expect(serialized).not.toContain('generativelanguage.googleapis.com');
  });
});
