import { useCallback, useEffect, useState } from 'react';

import { loadProgressDashboard } from '@/db/repositories/progressRepository';
import type { ProgressDashboardData } from '@/types/progress';

interface ProgressDashboardState {
  data: ProgressDashboardData | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useProgressDashboard(): ProgressDashboardState {
  const [data, setData] = useState<ProgressDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dashboard = await loadProgressDashboard();
      setData(dashboard);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load progress.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, isLoading, error, reload };
}
