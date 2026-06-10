import { useEffect, useState } from 'react';

import { getDatabase } from '@/db/connection';
import { ensureDefaultReminders } from '@/db/repositories/remindersRepository';
import { seedDatabaseIfNeeded } from '@/db/seed/exerciseSeed';
import { hydratePreferencesFromStorage } from '@/services/preferences/hydratePreferences';
import { registerNotificationLifecycle } from '@/services/notifications/notificationService';

interface DatabaseState {
  isReady: boolean;
  error: string | null;
  exerciseCount: number;
}

export function useDatabase(bootAttempt = 0): DatabaseState {
  const [state, setState] = useState<DatabaseState>({
    isReady: false,
    error: null,
    exerciseCount: 0,
  });

  useEffect(() => {
    let mounted = true;
    let unregisterNotifications: (() => void) | undefined;

    setState({
      isReady: false,
      error: null,
      exerciseCount: 0,
    });

    async function init() {
      try {
        await getDatabase();
        const seedResult = await seedDatabaseIfNeeded();
        await ensureDefaultReminders();
        await hydratePreferencesFromStorage();
        unregisterNotifications = registerNotificationLifecycle();

        if (mounted) {
          setState({
            isReady: true,
            error: null,
            exerciseCount: seedResult.exerciseCount,
          });
        }
      } catch (error) {
        if (mounted) {
          setState({
            isReady: false,
            error: error instanceof Error ? error.message : 'Database initialization failed',
            exerciseCount: 0,
          });
        }
      }
    }

    void init();

    return () => {
      mounted = false;
      unregisterNotifications?.();
    };
  }, [bootAttempt]);

  return state;
}
