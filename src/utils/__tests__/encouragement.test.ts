import { mealLoggedEncouragement, weightLoggedEncouragement, workoutStreakEncouragement } from '../encouragement';

describe('encouragement copy', () => {
  it('keeps meal and weight log encouragement brief', () => {
    expect(mealLoggedEncouragement().title).toBe('Logged. Nice and steady.');
    expect(weightLoggedEncouragement(false).title).toBe('Weight logged.');
    expect(weightLoggedEncouragement(true).title).toBe('Weight updated.');
  });

  it('only celebrates workout streaks once they are meaningful', () => {
    expect(workoutStreakEncouragement(2)).toBeNull();
    expect(workoutStreakEncouragement(3)?.title).toBe('Three-day rhythm building.');
    expect(workoutStreakEncouragement(7)?.title).toBe('One week strong.');
    expect(workoutStreakEncouragement(14)?.title).toBe('Two-week rhythm.');
  });
});
