import {
  defaultTargetMinutesForProfile,
  exerciseCountBoundsForMinutes,
  planMeetsExerciseFloor,
} from '../sessionDurationBounds';

describe('sessionDurationBounds', () => {
  it('enforces floors for 15 / 25 / 35 minute sessions', () => {
    expect(exerciseCountBoundsForMinutes(15)).toEqual({
      minExercises: 5,
      maxExercises: 8,
      bucketMinutes: 15,
    });
    expect(exerciseCountBoundsForMinutes(25)).toEqual({
      minExercises: 8,
      maxExercises: 10,
      bucketMinutes: 25,
    });
    expect(exerciseCountBoundsForMinutes(35)).toEqual({
      minExercises: 10,
      maxExercises: 12,
      bucketMinutes: 35,
    });
  });

  it('uses the nearest lower bucket for in-between durations', () => {
    expect(exerciseCountBoundsForMinutes(20).minExercises).toBe(5);
    expect(exerciseCountBoundsForMinutes(20).bucketMinutes).toBe(15);
    expect(exerciseCountBoundsForMinutes(30).minExercises).toBe(8);
    expect(exerciseCountBoundsForMinutes(30).bucketMinutes).toBe(25);
    expect(exerciseCountBoundsForMinutes(40).minExercises).toBe(10);
    expect(exerciseCountBoundsForMinutes(40).bucketMinutes).toBe(35);
  });

  it('maps training frequency to default minutes', () => {
    expect(defaultTargetMinutesForProfile('none')).toBe(15);
    expect(defaultTargetMinutesForProfile('1_2')).toBe(25);
    expect(defaultTargetMinutesForProfile('3_4')).toBe(35);
    expect(defaultTargetMinutesForProfile('5_plus')).toBe(35);
  });

  it('checks plan floors', () => {
    expect(planMeetsExerciseFloor(5, 15)).toBe(true);
    expect(planMeetsExerciseFloor(4, 15)).toBe(false);
    expect(planMeetsExerciseFloor(8, 25)).toBe(true);
    expect(planMeetsExerciseFloor(7, 25)).toBe(false);
    expect(planMeetsExerciseFloor(10, 35)).toBe(true);
    expect(planMeetsExerciseFloor(9, 35)).toBe(false);
  });
});
