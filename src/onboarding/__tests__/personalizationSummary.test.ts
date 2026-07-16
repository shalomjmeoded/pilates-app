import { buildPersonalizationSummary } from '../personalizationSummary';

describe('buildPersonalizationSummary', () => {
  it('summarizes frequency, first movement preference, equipment, and pace', () => {
    expect(
      buildPersonalizationSummary({
        trainingFrequency: '3_4',
        exercisePreferences: ['mat_pilates'],
        availableEquipment: [],
        pace: 0.5,
      }),
    ).toBe('4 sessions/week · Mat Pilates · Mat only · Moderate pace');
  });

  it('names a single selected prop', () => {
    expect(
      buildPersonalizationSummary({
        trainingFrequency: '3_4',
        exercisePreferences: ['core_focus'],
        availableEquipment: ['resistance band'],
        pace: 0.5,
      }),
    ).toBe('4 sessions/week · Core Focus · Resistance band · Moderate pace');
  });

  it('uses calm fallbacks when optional answers are absent', () => {
    expect(
      buildPersonalizationSummary({
        trainingFrequency: null,
        exercisePreferences: [],
        pace: null,
      }),
    ).toContain('Balanced movement · Mat only · Moderate pace');
  });
});
