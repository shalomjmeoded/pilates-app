import { validateManualTargets } from '../nutritionValidation';

describe('validateManualTargets', () => {
  it('rejects negative values', () => {
    const result = validateManualTargets(
      { calories: -1, proteinG: 100, carbsG: 100, fatG: 50, fiberG: 20 },
      'female',
    );
    expect(result.valid).toBe(false);
  });

  it('flags low calorie targets for female profiles', () => {
    const result = validateManualTargets(
      { calories: 1100, proteinG: 100, carbsG: 100, fatG: 50, fiberG: 20 },
      'female',
    );
    expect(result.valid).toBe(true);
    expect(result.safetyWarning).not.toBeNull();
  });

  it('uses male threshold', () => {
    const result = validateManualTargets(
      { calories: 1400, proteinG: 100, carbsG: 100, fatG: 50, fiberG: 20 },
      'male',
    );
    expect(result.safetyWarning?.threshold).toBe(1500);
  });
});
