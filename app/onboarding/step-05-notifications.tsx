import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { OptionCard, OnboardingShell } from '@/components/onboarding';
import { Text } from '@/components/ui/Text';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import {
  getNotificationsSupportMessage,
  requestNotificationPermissions,
} from '@/services/notifications/notificationService';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors, radius, spacing } from '@/theme';

const REMINDER_PREVIEW = [
  { icon: 'silverware-fork-knife' as const, time: '8:00', label: 'Breakfast check-in' },
  { icon: 'dumbbell' as const, time: '18:30', label: 'Workout window' },
  { icon: 'message-text-outline' as const, time: 'Sunday', label: 'Coach recap' },
];

export default function Step05Notifications() {
  const { step, goNext, goBack } = useOnboardingNavigation(5);
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
    await requestPermission();
    goNext();
  };

  return (
    <OnboardingShell
      step={step}
      title="Gentle reminders?"
      subtitle="Optional nudges for meals and workouts."
      onBack={goBack}
      onNext={() => void handleNext()}
      nextLabel="Continue"
    >
      <OptionCard
        label="Use gentle reminders"
        description="Meals, workouts, and coaching tips."
        index={0}
        selected
        accessibilityLabel="Enable local reminders for meals, workouts, and coaching tips"
        onPress={() => patchDraft({ notificationsEnabled: true })}
      />

      <View style={styles.preview} accessibilityLabel="Reminder preview">
        <View style={styles.previewHeader}>
          <MaterialCommunityIcons name="bell-outline" size={18} color={colors.brandPrimary} />
          <Text variant="label" style={styles.previewTitle}>
            Reminder preview
          </Text>
        </View>
        <View style={styles.previewRows}>
          {REMINDER_PREVIEW.map((item) => (
            <View key={item.label} style={styles.previewRow}>
              <View style={styles.previewIcon}>
                <MaterialCommunityIcons name={item.icon} size={16} color={colors.brandSecondary} />
              </View>
              <Text variant="body" style={styles.previewLabel}>
                {item.label}
              </Text>
              <Text variant="caption" style={styles.previewTime}>
                {item.time}
              </Text>
            </View>
          ))}
        </View>
        <Text variant="caption" style={styles.previewNote}>
          Times can be changed later in Settings.
        </Text>
      </View>

      {statusMessage ? (
        <Text variant="bodyMuted" style={styles.status} accessibilityLiveRegion="polite">
          {statusMessage}
        </Text>
      ) : null}
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  preview: {
    gap: spacing.xs,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewTitle: {
    color: colors.brandPrimary,
  },
  previewRows: {
    gap: 8,
  },
  previewRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRose,
  },
  previewLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  previewTime: {
    color: colors.textMuted,
  },
  previewNote: {
    color: colors.textMuted,
  },
  status: {
    marginTop: spacing.xs,
  },
});
