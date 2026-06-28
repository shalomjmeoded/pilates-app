export interface EncouragementCopy {
  title: string;
  body?: string;
}

export function mealLoggedEncouragement(): EncouragementCopy {
  return {
    title: 'Logged. Nice and steady.',
    body: 'One small check-in keeps the day clearer.',
  };
}

export function weightLoggedEncouragement(isEditing: boolean): EncouragementCopy {
  if (isEditing) {
    return {
      title: 'Weight updated.',
      body: 'Your trend stays accurate.',
    };
  }

  return {
    title: 'Weight logged.',
    body: 'That signal helps your plan stay honest.',
  };
}

export function workoutStreakEncouragement(streakDays?: number): EncouragementCopy | null {
  if (!streakDays || streakDays < 3) {
    return null;
  }

  if (streakDays >= 14) {
    return {
      title: 'Two-week rhythm.',
      body: 'That is real momentum.',
    };
  }

  if (streakDays >= 7) {
    return {
      title: 'One week strong.',
      body: 'Your consistency is starting to compound.',
    };
  }

  return {
    title: 'Three-day rhythm building.',
    body: 'Small repeats are becoming a routine.',
  };
}
