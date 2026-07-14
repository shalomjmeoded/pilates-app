import {
  buildWeeklyTargetAdjustment,
  classifyPaceRatio,
  expectedLossFromDeficit,
  scaleCalorieDelta,
  TOO_FAST_RATIO,
  TOO_SLOW_RATIO,
} from '../weeklyTargetAdjustment';
import { observeWeeklyWeightPace } from '../observeWeeklyWeightPace';
import { DEFAULT_COACH_NUTRITION_PREFERENCES } from '@/types/preferences';

describe('observeWeeklyWeightPace', () => {
  it('returns null without enough span', () => {
    expect(
      observeWeeklyWeightPace(
        [
          { id: '1', weightKg: 90, loggedAt: '2026-07-10T00:00:00.000Z' },
          { id: '2', weightKg: 89.5, loggedAt: '2026-07-12T00:00:00.000Z' },
        ],
        14,
        new Date('2026-07-12T12:00:00.000Z'),
      ),
    ).toBeNull();
  });

  it('computes weekly loss rate over a 14-day window', () => {
    const pace = observeWeeklyWeightPace(
      [
        { id: '1', weightKg: 90, loggedAt: '2026-07-01T00:00:00.000Z' },
        { id: '2', weightKg: 89, loggedAt: '2026-07-08T00:00:00.000Z' },
      ],
      14,
      new Date('2026-07-10T00:00:00.000Z'),
    );
    expect(pace).not.toBeNull();
    expect(pace!.lossKgPerWeek).toBeCloseTo(1, 5);
  });
});

describe('weeklyTargetAdjustment', () => {
  const previous = {
    calories: 2200,
    proteinG: 160,
    carbsG: 200,
    fatG: 70,
    fiberG: 30,
  };

  it('classifies too fast / too slow / on track', () => {
    expect(classifyPaceRatio(1.6, 1)).toBe('too_fast');
    expect(classifyPaceRatio(0.4, 1)).toBe('too_slow');
    expect(classifyPaceRatio(1, 1)).toBe('on_track');
    expect(TOO_FAST_RATIO).toBe(1.5);
    expect(TOO_SLOW_RATIO).toBe(0.5);
  });

  it('scales calorie delta with a weekly cap', () => {
    expect(scaleCalorieDelta(2, 1)).toBeLessThanOrEqual(200);
    expect(scaleCalorieDelta(0.25, 1)).toBeGreaterThanOrEqual(100);
  });

  it('increases calories when loss is too fast', () => {
    const plan = buildWeeklyTargetAdjustment({
      previous,
      observedLossKgPerWeek: 1.6,
      expectedLossKgPerWeek: 0.8,
      prefs: { ...DEFAULT_COACH_NUTRITION_PREFERENCES, adjustEnabled: true },
      genderIdentity: 'male',
    });
    expect(plan?.reason).toBe('too_fast');
    expect(plan!.next.calories).toBeGreaterThan(previous.calories);
    expect(plan!.next.proteinG).toBe(previous.proteinG);
  });

  it('decreases carbs first when preferred', () => {
    const plan = buildWeeklyTargetAdjustment({
      previous,
      observedLossKgPerWeek: 0.2,
      expectedLossKgPerWeek: 0.8,
      prefs: {
        ...DEFAULT_COACH_NUTRITION_PREFERENCES,
        adjustEnabled: true,
        deficitCutPreference: 'carbs',
      },
      genderIdentity: 'female',
    });
    expect(plan?.reason).toBe('too_slow');
    expect(plan!.next.calories).toBeLessThan(previous.calories);
    expect(plan!.next.carbsG).toBeLessThan(previous.carbsG);
  });

  it('respects allowIncrease / allowDecrease flags', () => {
    expect(
      buildWeeklyTargetAdjustment({
        previous,
        observedLossKgPerWeek: 1.6,
        expectedLossKgPerWeek: 0.8,
        prefs: {
          ...DEFAULT_COACH_NUTRITION_PREFERENCES,
          adjustEnabled: true,
          allowIncrease: false,
        },
        genderIdentity: 'male',
      }),
    ).toBeNull();

    expect(
      buildWeeklyTargetAdjustment({
        previous,
        observedLossKgPerWeek: 0.2,
        expectedLossKgPerWeek: 0.8,
        prefs: {
          ...DEFAULT_COACH_NUTRITION_PREFERENCES,
          adjustEnabled: true,
          allowDecrease: false,
        },
        genderIdentity: 'male',
      }),
    ).toBeNull();
  });

  it('stays off when adjustEnabled is false by default', () => {
    expect(
      buildWeeklyTargetAdjustment({
        previous,
        observedLossKgPerWeek: 1.6,
        expectedLossKgPerWeek: 0.8,
        prefs: DEFAULT_COACH_NUTRITION_PREFERENCES,
        genderIdentity: 'male',
      }),
    ).toBeNull();
  });

  it('respects calorie safeguard floor on decreases', () => {
    const plan = buildWeeklyTargetAdjustment({
      previous: { ...previous, calories: 1250 },
      observedLossKgPerWeek: 0.1,
      expectedLossKgPerWeek: 0.8,
      prefs: {
        ...DEFAULT_COACH_NUTRITION_PREFERENCES,
        adjustEnabled: true,
        calorieSafeguardEnabled: true,
        deficitCutPreference: 'balanced',
      },
      genderIdentity: 'female',
    });
    expect(plan).not.toBeNull();
    expect(plan!.next.calories).toBeGreaterThanOrEqual(1200);
  });

  it('converts daily deficit to expected weekly loss', () => {
    // 770 kcal/day → 0.7 kg/week
    expect(expectedLossFromDeficit(770)).toBeCloseTo(0.7, 5);
  });
});
