import { useSegments } from 'expo-router';
import { type ReactNode, useEffect } from 'react';
import { AppState } from 'react-native';
import { PostHogProvider } from 'posthog-react-native';

import {
  captureProductEvent,
  getElapsedOnboardingSeconds,
} from './analyticsCore';
import { productAnalyticsClient } from './productAnalytics';
import { getOnboardingRoute, ONBOARDING_TOTAL_STEPS } from '@/onboarding/constants';
import { getOnboardingPhase, getOnboardingPhaseIndex } from '@/onboarding/stepCopy';
import { useOnboardingStore } from '@/stores/onboardingStore';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  if (!productAnalyticsClient) {
    return children;
  }

  return (
    <PostHogProvider client={productAnalyticsClient} autocapture={false}>
      <OnboardingBackgroundTracker />
      {children}
    </PostHogProvider>
  );
}

function OnboardingBackgroundTracker() {
  const segments = useSegments();
  const inOnboarding = segments[0] === 'onboarding';

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'background' || !inOnboarding) {
        return;
      }

      const { currentStep, entryMode } = useOnboardingStore.getState();
      captureProductEvent('onboarding backgrounded', {
        route_key: getOnboardingRoute(Math.min(currentStep, ONBOARDING_TOTAL_STEPS)),
        phase_number: getOnboardingPhaseIndex(currentStep),
        phase_name: getOnboardingPhase(currentStep),
        step_index: currentStep,
        entry_mode: entryMode,
        elapsed_onboarding_seconds: getElapsedOnboardingSeconds(),
      });
    });

    return () => subscription.remove();
  }, [inOnboarding]);

  return null;
}
