import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';

import { getOnboardingRoute, ONBOARDING_TOTAL_STEPS } from '@/onboarding/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { captureProductEvent, getElapsedOnboardingSeconds } from '@/services/analytics/analyticsCore';
import { getOnboardingPhase, getOnboardingPhaseIndex } from '@/onboarding/stepCopy';

export function useOnboardingNavigation(step: number) {
  const router = useRouter();
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const entryMode = useOnboardingStore((state) => state.entryMode);

  const eventProperties = useCallback(
    (eventStep = step) => ({
      route_key: getOnboardingRoute(eventStep),
      phase_number: getOnboardingPhaseIndex(eventStep),
      phase_name: getOnboardingPhase(eventStep),
      step_index: eventStep,
      entry_mode: entryMode,
      elapsed_onboarding_seconds: getElapsedOnboardingSeconds(),
    }),
    [entryMode, step],
  );

  useEffect(() => {
    setCurrentStep(step);
    captureProductEvent('onboarding step viewed', eventProperties());
  }, [eventProperties, setCurrentStep, step]);

  const trackCompletion = useCallback(() => {
    captureProductEvent('onboarding step completed', eventProperties());
  }, [eventProperties]);

  const goToStep = useCallback(
    (targetStep: number) => {
      if (targetStep < 1 || targetStep > ONBOARDING_TOTAL_STEPS) {
        return;
      }
      if (targetStep > step) {
        trackCompletion();
      }
      router.replace(`/onboarding/${getOnboardingRoute(targetStep)}`);
    },
    [router, step, trackCompletion],
  );

  const goNext = useCallback(() => {
    if (step >= ONBOARDING_TOTAL_STEPS) {
      return;
    }
    trackCompletion();
    router.push(`/onboarding/${getOnboardingRoute(step + 1)}`);
  }, [router, step, trackCompletion]);

  const pushToStep = useCallback(
    (targetStep: number) => {
      if (targetStep < 1 || targetStep > ONBOARDING_TOTAL_STEPS) {
        return;
      }
      if (targetStep > step) {
        trackCompletion();
      }
      router.push(`/onboarding/${getOnboardingRoute(targetStep)}`);
    },
    [router, step, trackCompletion],
  );

  const replaceNext = useCallback(() => {
    if (step >= ONBOARDING_TOTAL_STEPS) {
      return;
    }
    trackCompletion();
    router.replace(`/onboarding/${getOnboardingRoute(step + 1)}`);
  }, [router, step, trackCompletion]);

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
    pushToStep,
    goNext,
    replaceNext,
    goBack,
    replaceToTabs,
  };
}
