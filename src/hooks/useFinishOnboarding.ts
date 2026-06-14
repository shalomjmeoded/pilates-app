import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { getActiveNutritionTargets } from '@/db/repositories/nutritionRepository';
import { completeOnboarding } from '@/services/onboarding/completeOnboarding';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useRecalibrationStore } from '@/stores/recalibrationStore';

export function useFinishOnboarding() {
  const router = useRouter();
  const draft = useOnboardingStore((state) => state.draft);
  const rebuildMode = useOnboardingStore((state) => state.rebuildMode);
  const setRebuildMode = useOnboardingStore((state) => state.setRebuildMode);
  const toProfile = useOnboardingStore((state) => state.toProfile);
  const setOnboardingCompleted = usePreferencesStore((state) => state.setOnboardingCompleted);
  const setComparison = useRecalibrationStore((state) => state.setComparison);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = useCallback(
    async () => {
      const profile = toProfile();
      if (!profile) {
        setError('Onboarding profile is incomplete.');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const previousTargets = await getActiveNutritionTargets(today);

        await completeOnboarding({
          profile,
          draft,
        });

        setOnboardingCompleted(true);
        setRebuildMode(false);

        if (rebuildMode && draft.baselinePlan) {
          setComparison({
            previous: {
              calories: previousTargets?.calories ?? 0,
              proteinG: previousTargets?.proteinG ?? 0,
              carbsG: previousTargets?.carbsG ?? 0,
              fatG: previousTargets?.fatG ?? 0,
              fiberG: previousTargets?.fiberG ?? 0,
            },
            next: {
              calories: draft.baselinePlan.macros.calories,
              proteinG: draft.baselinePlan.macros.proteinG,
              carbsG: draft.baselinePlan.macros.carbsG,
              fatG: draft.baselinePlan.macros.fatG,
              fiberG: draft.baselinePlan.macros.fiberG,
            },
          });
          router.replace('/(tabs)/settings/plan-updated');
          return;
        }

        router.replace('/onboarding/step-18-workout-loading');
      } catch (submitError) {
        setError(
          submitError instanceof Error ? submitError.message : 'Could not save onboarding data.',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      draft,
      rebuildMode,
      router,
      setComparison,
      setOnboardingCompleted,
      setRebuildMode,
      toProfile,
    ],
  );

  return { finish, isSubmitting, error, rebuildMode };
}
