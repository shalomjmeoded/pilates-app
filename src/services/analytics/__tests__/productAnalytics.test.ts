import { sanitizeAnalyticsProperties } from '../analyticsCore';

describe('product analytics privacy boundary', () => {
  it('keeps only approved non-health funnel properties', () => {
    expect(
      sanitizeAnalyticsProperties({
        route_key: 'step-02-frequency',
        phase_number: 1,
        entry_mode: 'fresh',
        selected_plan: 'yearly',
        weight: 72,
        birth_year: 1990,
        meal_text: 'private meal',
        photo_uri: 'private-photo.jpg',
      }),
    ).toEqual({
      route_key: 'step-02-frequency',
      phase_number: 1,
      entry_mode: 'fresh',
      selected_plan: 'yearly',
    });
  });

  it('drops objects and arrays even when attached to an approved key', () => {
    expect(
      sanitizeAnalyticsProperties({
        route_key: { sensitive: true },
        step_index: [3],
        elapsed_onboarding_seconds: 18,
      }),
    ).toEqual({ elapsed_onboarding_seconds: 18 });
  });
});
