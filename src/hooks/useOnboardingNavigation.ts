import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { getOnboardingRoute, ONBOARDING_TOTAL_STEPS } from '@/onboarding/constants';

export function useOnboardingNavigation(step: number) {
  const router = useRouter();

  const goToStep = useCallback(
    (targetStep: number) => {
      if (targetStep < 1 || targetStep > ONBOARDING_TOTAL_STEPS) {
        return;
      }
      router.replace(`/onboarding/${getOnboardingRoute(targetStep)}`);
    },
    [router],
  );

  const goNext = useCallback(() => {
    if (step >= ONBOARDING_TOTAL_STEPS) {
      return;
    }
    router.push(`/onboarding/${getOnboardingRoute(step + 1)}`);
  }, [router, step]);

  const replaceNext = useCallback(() => {
    if (step >= ONBOARDING_TOTAL_STEPS) {
      return;
    }
    router.replace(`/onboarding/${getOnboardingRoute(step + 1)}`);
  }, [router, step]);

  const goBack = useCallback(() => {
    if (step <= 1) {
      return;
    }
    router.back();
  }, [router, step]);

  const replaceToTabs = useCallback(() => {
    router.replace('/(tabs)/workout');
  }, [router]);

  return {
    step,
    totalSteps: ONBOARDING_TOTAL_STEPS,
    goToStep,
    goNext,
    replaceNext,
    goBack,
    replaceToTabs,
  };
}
