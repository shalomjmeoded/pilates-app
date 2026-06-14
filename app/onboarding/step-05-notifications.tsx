import { useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { VisualAsset } from '@/components/media';
import { Text } from '@/components/ui/Text';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import {
  getNotificationsSupportMessage,
  requestNotificationPermissions,
} from '@/services/notifications/notificationService';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors, radius, spacing } from '@/theme';

export default function Step05Notifications() {
  const { step, goNext, goBack } = useOnboardingNavigation(4);
  const notificationsEnabled = useOnboardingStore((state) => state.draft.notificationsEnabled);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const supportMessage = getNotificationsSupportMessage();
  const setAnnouncedStatus = (message: string) => {
    setStatusMessage(message);
    AccessibilityInfo.announceForAccessibility(message);
  };

  const requestPermission = async () => {
    if (supportMessage) {
      setAnnouncedStatus(supportMessage);
      patchDraft({ notificationsEnabled: false });
      return;
    }

    const granted = await requestNotificationPermissions();
    patchDraft({ notificationsEnabled: granted });
    setAnnouncedStatus(
      granted
        ? 'Reminders enabled. You can fine-tune times in Settings.'
        : 'No problem — BetterMe works fully without reminders.',
    );
  };

  const handleNext = async () => {
    if (notificationsEnabled) {
      await requestPermission();
    }
    goNext();
  };

  return (
    <OnboardingShell
      step={step}
      title="Gentle reminders?"
      subtitle="Optional nudges for meals and workouts."
      insightText={notificationsEnabled ? 'Great. We will remind softly.' : 'No problem. You can add later.'}
      onBack={goBack}
      onNext={() => void handleNext()}
      nextLabel="Continue"
    >
      <View style={styles.visualCard}>
        <VisualAsset icon="bell-ring-outline" fallback="icon" size={56} accessibilityLabel="Reminders" />
        <Text variant="caption" style={styles.visualCaption}>
          Quiet, local reminders only.
        </Text>
      </View>

      <OptionCard
        label="Use gentle reminders"
        description="Breakfast, lunch, dinner, workouts, and coaching tips."
        index={0}
        selected={notificationsEnabled}
        accessibilityLabel="Enable local reminders for meals, workouts, and coaching tips"
        onPress={() => patchDraft({ notificationsEnabled: true })}
      />

      <OptionCard
        label="Not now"
        description="Set up reminders later in Settings."
        index={1}
        selected={!notificationsEnabled}
        accessibilityLabel="Do not enable local reminders during onboarding"
        onPress={() => patchDraft({ notificationsEnabled: false })}
      />

      {statusMessage ? (
        <Text variant="bodyMuted" style={styles.status} accessibilityLiveRegion="polite">
          {statusMessage}
        </Text>
      ) : null}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  visualCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    minHeight: 118,
  },
  visualCaption: {
    textAlign: 'center',
  },
  status: {
    marginTop: spacing.xs,
  },
});
