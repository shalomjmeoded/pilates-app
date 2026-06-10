import { useCallback, useState } from 'react';

import {
  loadLatestPhysiqueAssessment,
  removePhysiqueAssessment,
} from '@/services/physique/physiqueAssessmentService';
import type { StoredPhysiqueAssessment } from '@/types/physiqueAssessment';

export function usePhysiqueAssessment() {
  const [latest, setLatest] = useState<StoredPhysiqueAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const row = await loadLatestPhysiqueAssessment();
      setLatest(row);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load assessment.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAssessment = useCallback(async (id: string) => {
    setError(null);
    try {
      await removePhysiqueAssessment(id);
      setLatest(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete assessment.');
    }
  }, []);

  return {
    latest,
    isLoading,
    error,
    load,
    deleteAssessment,
  };
}
