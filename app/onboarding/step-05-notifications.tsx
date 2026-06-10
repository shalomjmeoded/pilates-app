import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { NotificationsIllustration } from '@/components/illustrations/OnboardingIllustrations';
import { FadeInView } from '@/components/motion/FadeInView';
import { Text } from '@/components/ui/Text';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import {
  getNotificationsSupportMessage,
  requestNotificationPermissions,
} from '@/services/notifications/notificationService';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors, radius, spacing } from '@/theme';

export default function Step05Notifications() {
  const { step, goNext, goBack } = useOnboardingNavigation(6);
  const notificationsEnabled = useOnboardingStore((state) => state.draft.notificationsEnabled);
  const patchDraft = useOnboardingStore((state) => state.patchDraft);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const supportMessage = getNotificationsSupportMessage();

  const requestPermission = async () => {
    if (supportMessage) {
      setStatusMessage(supportMessage);
      return;
    }

    const granted = await requestNotificationPermissions();
    patchDraft({ notificationsEnabled: granted });
    setStatusMessage(
      granted
        ? 'Reminders enabled. You can fine-tune times in Settings.'
        : 'No problem — Tune works fully without notifications.',
    );
  };

  return (
    <OnboardingShell
      step={step}
      title="Stay gently on track"
      subtitle="Local reminders only — never ads or marketing pushes."
      onBack={goBack}
      onNext={goNext}
      nextLabel={notificationsEnabled ? 'Continue' : 'Continue without reminders'}
    >
      <FadeInView>
        <View style={styles.illustrationWrap}>
          <NotificationsIllustration />
        </View>
      </FadeInView>

      <View style={styles.card}>
        <Text variant="body">
          Gentle nudges for meals and movement, on your schedule. You can change or turn them off
          anytime in Settings.
        </Text>
      </View>

      <OptionCard
        label="Enable local reminders"
        description="Breakfast, lunch, dinner, workouts, and coaching tips."
        selected={notificationsEnabled}
        onPress={() => void requestPermission()}
      />

      {statusMessage ? (
        <Text variant="bodyMuted" style={styles.status}>
          {statusMessage}
        </Text>
      ) : null}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  illustrationWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  card: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
  },
  status: {
    marginTop: spacing.xs,
  },
});
