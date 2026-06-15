import { useEffect, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { OnboardingShell, PlanRevealHero } from '@/components/onboarding';
import { Text } from '@/components/ui/Text';
import { SAFETY_WARNING_MESSAGE } from '@/engines/calculations';
import { trainingFrequencyToWorkoutsPerWeek } from '@/engines/monetization/premiumAccess';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors, radius, spacing } from '@/theme';
import { successNotificationHaptic } from '@/utils/haptics';

export default function Step16PlanReveal() {
  const { step, goNext, goToStep } = useOnboardingNavigation(13);
  const draft = useOnboardingStore((state) => state.draft);
  const baselinePlan = draft.baselinePlan;
  const hasPlayedSuccess = useRef(false);

  useEffect(() => {
    if (baselinePlan && !hasPlayedSuccess.current) {
      hasPlayedSuccess.current = true;
      successNotificationHaptic();
      AccessibilityInfo.announceForAccessibility('Your personalized plan is ready.');
    }
  }, [baselinePlan]);

  if (!baselinePlan) {
    return (
      <OnboardingShell
        step={step}
        title="Almost there"
        subtitle="Finalizing your targets."
        onBack={() => goToStep(12)}
        onNext={() => goToStep(12)}
        nextLabel="Review plan setup"
        phaseLabel="Creating your plan"
        reasonWhy={null}
      >
        <View style={styles.disclaimer}>
          <Text variant="bodyMuted" style={styles.fallbackText}>
            Reopen the previous step to finalize your personalized plan.
          </Text>
        </View>
      </OnboardingShell>
    );
  }

  const { macros, goalCalories, safetyWarning } = baselinePlan;
  const workoutsPerWeek = trainingFrequencyToWorkoutsPerWeek(draft.trainingFrequency);

  return (
    <OnboardingShell
      step={step}
      title="Your plan is ready"
      subtitle="Adjust anytime in Settings."
      onBack={() => goToStep(12)}
      onNext={goNext}
      nextLabel="Continue"
      phaseLabel="Your reveal"
      reasonWhy={null}
      hideStepIndicator={false}
      scrollEnabled={false}
      titleLines={1}
    >
      <PlanRevealHero
        calories={goalCalories}
        proteinG={macros.proteinG}
        workoutsPerWeek={workoutsPerWeek}
        carbsG={macros.carbsG}
        fatG={macros.fatG}
        fiberG={macros.fiberG}
      />

      {safetyWarning.triggered ? (
        <View style={styles.warning} accessibilityRole="alert">
          <Text variant="label" style={styles.warningTitle}>
            Safety note
          </Text>
          <Text variant="body" style={styles.warningText}>
            {SAFETY_WARNING_MESSAGE}
          </Text>
        </View>
      ) : null}

    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  warning: {
    backgroundColor: colors.warningSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.xs,
    paddingVertical: 8,
  },
  warningText: {
    color: colors.textDark,
    fontSize: 13,
    lineHeight: 17,
  },
  warningTitle: {
    color: colors.textStrong,
    marginBottom: 4,
  },
  disclaimer: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
  },
  fallbackText: {
    lineHeight: 22,
  },
});
