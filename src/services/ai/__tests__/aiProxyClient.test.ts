import { buildAiEndpointUrl } from '../aiProxyEndpoints';

describe('aiProxyClient endpoints', () => {
  it('builds per-feature proxy URLs from base URL', () => {
    expect(buildAiEndpointUrl('http://localhost:8787', 'meal_text_estimate')).toBe(
      'http://localhost:8787/ai/meal-text',
    );
    expect(buildAiEndpointUrl('http://localhost:8787', 'meal_photo_estimate')).toBe(
      'http://localhost:8787/ai/meal-photo',
    );
    expect(buildAiEndpointUrl('http://localhost:8787', 'exercise_substitution')).toBe(
      'http://localhost:8787/ai/exercise-swap',
    );
    expect(buildAiEndpointUrl('http://localhost:8787', 'workout_change_suggestion')).toBe(
      'http://localhost:8787/ai/workout-change',
    );
    expect(buildAiEndpointUrl('http://localhost:8787', 'weekly_coach')).toBe(
      'http://localhost:8787/ai/weekly-coach',
    );
    expect(buildAiEndpointUrl('http://localhost:8787', 'physique_assessment')).toBe(
      'http://localhost:8787/ai/physique-assessment',
    );
  });

  it('strips legacy /api/ai-proxy suffix from base URL', () => {
    expect(buildAiEndpointUrl('http://localhost:8787/api/ai-proxy', 'meal_text_estimate')).toBe(
      'http://localhost:8787/ai/meal-text',
    );
  });
});
