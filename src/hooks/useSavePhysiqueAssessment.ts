import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { savePhysiqueAssessment } from '@/services/physique/physiqueAssessmentService';
import { usePhysiqueAssessmentReviewStore } from '@/stores/physiqueAssessmentReviewStore';
import type { AiPhysiqueAssessment } from '@/types/ai';

export function useSavePhysiqueAssessment() {
  const router = useRouter();
  const clear = usePhysiqueAssessmentReviewStore((state) => state.clear);
  const disclaimerAcceptedAt = usePhysiqueAssessmentReviewStore(
    (state) => state.disclaimerAcceptedAt,
  );
  const notes = usePhysiqueAssessmentReviewStore((state) => state.notes);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(
    async (assessment: AiPhysiqueAssessment) => {
      if (!disclaimerAcceptedAt) {
        setError('Disclaimer acceptance is required before saving.');
        return false;
      }

      setIsSaving(true);
      setError(null);

      try {
        await savePhysiqueAssessment({
          assessment,
          disclaimerAcceptedAt,
          notes: notes || undefined,
        });
        clear();
        router.replace('/(tabs)/progress');
        return true;
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Could not save assessment.');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [clear, disclaimerAcceptedAt, notes, router],
  );

  return {
    save,
    error,
    isSaving,
  };
}
