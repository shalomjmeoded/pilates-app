import {
  buildBaselinePlan,
  calculateBmr,
  calculateBmi,
  calculateGoalCalories,
  evaluateCalorieSafety,
} from '../index';

describe('calculateBmr', () => {
  it('uses female formula', () => {
    const result = calculateBmr({
      genderIdentity: 'female',
      weightKg: 65,
      heightCm: 165,
      birthYear: 1995,
    });
    expect(result.formula).toBe('female');
    expect(result.bmr).toBeGreaterThan(1200);
    expect(result.bmr).toBeLessThan(1600);
  });

  it('uses male formula', () => {
    const result = calculateBmr({
      genderIdentity: 'male',
      weightKg: 80,
      heightCm: 180,
      birthYear: 1990,
    });
    expect(result.formula).toBe('male');
    expect(result.bmr).toBeGreaterThan(1600);
  });

  it('uses Katch-McArdle when body fat percent is provided', () => {
    const withBf = calculateBmr({
      genderIdentity: 'male',
      weightKg: 80,
      heightCm: 180,
      birthYear: 1990,
      bodyFatPercent: 10,
    });
    const withoutBf = calculateBmr({
      genderIdentity: 'male',
      weightKg: 80,
      heightCm: 180,
      birthYear: 1990,
    });

    expect(withBf.formula).toBe('katch_mcardle');
    expect(withBf.bmr).toBeGreaterThan(withoutBf.bmr);
  });

  it('uses neutral midpoint for non-binary', () => {
    const female = calculateBmr({
      genderIdentity: 'female',
      weightKg: 70,
      heightCm: 170,
      birthYear: 1992,
    });
    const male = calculateBmr({
      genderIdentity: 'male',
      weightKg: 70,
      heightCm: 170,
      birthYear: 1992,
    });
    const neutral = calculateBmr({
      genderIdentity: 'non_binary',
      weightKg: 70,
      heightCm: 170,
      birthYear: 1992,
    });
    expect(neutral.bmr).toBeGreaterThan(female.bmr);
    expect(neutral.bmr).toBeLessThan(male.bmr);
  });
});

describe('calculateBmi', () => {
  it('calculates BMI from metric inputs', () => {
    expect(calculateBmi(70, 175)).toBe(22.9);
  });
});

describe('evaluateCalorieSafety', () => {
  it('triggers warning below female threshold', () => {
    const warning = evaluateCalorieSafety(1100, 'female');
    expect(warning.triggered).toBe(true);
    expect(warning.threshold).toBe(1200);
  });

  it('uses higher threshold for male', () => {
    const warning = evaluateCalorieSafety(1400, 'male');
    expect(warning.triggered).toBe(true);
    expect(warning.threshold).toBe(1500);
  });
});

describe('calculateGoalCalories', () => {
  it('never returns below 1000 kcal for auto-calculated targets', () => {
    const goalCalories = calculateGoalCalories(1100, 'get_toned', 1);
    expect(goalCalories).toBe(1000);
  });

  it('does not raise calories that are already above the floor', () => {
    const goalCalories = calculateGoalCalories(2200, 'get_toned', 0.5);
    expect(goalCalories).toBeGreaterThan(1000);
  });
});

describe('buildBaselinePlan', () => {
  it('returns complete baseline plan for sample profile', () => {
    const plan = buildBaselinePlan({
      genderIdentity: 'female',
      birthYear: 1994,
      heightCm: 168,
      currentWeightKg: 68,
      goalWeightKg: 62,
      trainingFrequency: '3_4',
      fitnessGoal: 'get_toned',
      weightTrajectory: 'weight_loss',
      paceKgPerWeek: 0.5,
    });

    expect(plan.bmr).toBeGreaterThan(0);
    expect(plan.tdee).toBeGreaterThan(plan.bmr);
    expect(plan.goalCalories).toBeLessThan(plan.tdee);
    expect(plan.macros.proteinG).toBeGreaterThan(0);
    expect(plan.macros.fiberG).toBeGreaterThanOrEqual(25);
    expect(plan.roadmap).toHaveLength(25);
    expect(plan.roadmap[0].projectedWeightKg).toBe(68);
  });

  it('uses lean-mass protein basis when body fat is provided', () => {
    const withBf = buildBaselinePlan({
      genderIdentity: 'male',
      birthYear: 1990,
      heightCm: 180,
      currentWeightKg: 80,
      goalWeightKg: 75,
      trainingFrequency: '3_4',
      fitnessGoal: 'build_muscle',
      weightTrajectory: 'lean_mass',
      paceKgPerWeek: 0.5,
      bodyFatPercent: 10,
    });
    const withoutBf = buildBaselinePlan({
      genderIdentity: 'male',
      birthYear: 1990,
      heightCm: 180,
      currentWeightKg: 80,
      goalWeightKg: 75,
      trainingFrequency: '3_4',
      fitnessGoal: 'build_muscle',
      weightTrajectory: 'lean_mass',
      paceKgPerWeek: 0.5,
    });

    expect(withBf.macros.proteinG).toBeLessThan(withoutBf.macros.proteinG);
    expect(withBf.bmr).toBeGreaterThan(withoutBf.bmr);
  });
});
