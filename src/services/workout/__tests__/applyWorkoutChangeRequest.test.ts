import {
  countWorkoutChangeEventsForDate,
  logWorkoutChangeEvent,
  upsertWorkoutChangeFeedback,
} from '@/db/repositories/workoutRepository';
import { getWeekStartDate } from '@/engines/coaching/weekStart';
import { aiFacade } from '@/services/ai';

import { applyWorkoutChangeRequest } from '../applyWorkoutChangeRequest';
import { regenerateUpcomingWorkoutPlans } from '../regenerateUpcomingWorkoutPlans';

jest.mock('@/services/ai', () => ({
  aiFacade: {
    suggestWorkoutChange: jest.fn(),
  },
}));

jest.mock('@/db/repositories/workoutRepository', () => ({
  countWorkoutChangeEventsForDate: jest.fn(),
  upsertWorkoutChangeFeedback: jest.fn(),
  logWorkoutChangeEvent: jest.fn(),
}));

jest.mock('../regenerateUpcomingWorkoutPlans', () => ({
  regenerateUpcomingWorkoutPlans: jest.fn(),
}));

jest.mock('@/engines/coaching/weekStart', () => ({
  getWeekStartDate: jest.fn(),
}));

describe('applyWorkoutChangeRequest daily limits', () => {
  const mockCountChanges = countWorkoutChangeEventsForDate as jest.MockedFunction<
    typeof countWorkoutChangeEventsForDate
  >;
  const mockUpsertFeedback = upsertWorkoutChangeFeedback as jest.MockedFunction<
    typeof upsertWorkoutChangeFeedback
  >;
  const mockLogChangeEvent = logWorkoutChangeEvent as jest.MockedFunction<typeof logWorkoutChangeEvent>;
  const mockSuggestWorkoutChange = aiFacade.suggestWorkoutChange as jest.MockedFunction<
    typeof aiFacade.suggestWorkoutChange
  >;
  const mockRegenPlans = regenerateUpcomingWorkoutPlans as jest.MockedFunction<
    typeof regenerateUpcomingWorkoutPlans
  >;
  const mockWeekStart = getWeekStartDate as jest.MockedFunction<typeof getWeekStartDate>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCountChanges.mockResolvedValue(0);
    mockWeekStart.mockReturnValue('2026-06-09');
    mockSuggestWorkoutChange.mockResolvedValue({
      focusArea: 'core',
      targetMinutes: 25,
      intensity: 'balanced',
      coachRationale: 'Refined by coach.',
    });
    mockUpsertFeedback.mockResolvedValue(undefined);
    mockRegenPlans.mockResolvedValue({
      regeneratedDates: ['2026-06-13', '2026-06-14'],
      skippedDates: [],
    });
    mockLogChangeEvent.mockResolvedValue(undefined);
  });

  it('blocks workout changes after reaching two changes for the day', async () => {
    mockCountChanges.mockResolvedValue(2);

    await expect(
      applyWorkoutChangeRequest({
        planDate: '2026-06-13',
        request: {
          focusArea: 'core',
          targetMinutes: 25,
          intensity: 'balanced',
          coachNote: 'Keep it gentle',
        },
        todayMovementCount: 10,
        todayEstimatedMinutes: 22,
      }),
    ).rejects.toThrow('already changed today’s workout twice');

    expect(mockSuggestWorkoutChange).not.toHaveBeenCalled();
    expect(mockRegenPlans).not.toHaveBeenCalled();
  });

  it('returns remainingChangesToday as 1 after first successful change', async () => {
    mockCountChanges.mockResolvedValue(0);

    const result = await applyWorkoutChangeRequest({
      planDate: '2026-06-13',
      request: {
        focusArea: 'core',
        targetMinutes: 25,
        intensity: 'balanced',
        coachNote: 'Prefer posture cues',
      },
      todayMovementCount: 11,
      todayEstimatedMinutes: 25,
    });

    expect(result.remainingChangesToday).toBe(1);
    expect(mockLogChangeEvent).toHaveBeenCalledWith(
      '2026-06-13',
      '2026-06-13',
      expect.objectContaining({
        focusArea: 'core',
        targetMinutes: 25,
        intensity: 'balanced',
      }),
    );
  });
});
