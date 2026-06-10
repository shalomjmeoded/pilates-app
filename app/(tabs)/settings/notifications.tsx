import { useCallback, useEffect, useState } from 'react';
import { Linking, StyleSheet } from 'react-native';

import { ReminderTimeRow, SettingsScreenShell } from '@/components/settings';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { getReminders, updateReminder } from '@/db/repositories/remindersRepository';
import {
  areNotificationsSupported,
  getNotificationPermissionStatus,
  getNotificationsSupportMessage,
  requestNotificationPermissions,
  syncAllReminders,
} from '@/services/notifications/notificationService';
import type { Reminder } from '@/types/settings';
import { colors, spacing } from '@/theme';

export default function NotificationsSettingsScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const [loaded, status] = await Promise.all([getReminders(), getNotificationPermissionStatus()]);
    setReminders(loaded);
    setPermissionStatus(status);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handlePermission = async () => {
    const granted = await requestNotificationPermissions();
    if (!granted) {
      await Linking.openSettings();
    }
    await reload();
    await syncAllReminders();
  };

  const patchReminder = async (
    type: Reminder['type'],
    patch: Partial<Pick<Reminder, 'enabled' | 'hour' | 'minute'>>,
  ) => {
    const updated = await updateReminder(type, patch);
    if (!updated) return;

    setReminders((current) => current.map((item) => (item.type === type ? updated : item)));

    if (patch.enabled && permissionStatus !== 'granted') {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        await reload();
        return;
      }
    }

    await syncAllReminders();
  };

  if (isLoading) {
    return (
      <SettingsScreenShell title="Notifications" subtitle="Loading...">
        <Text variant="bodyMuted">Loading reminders...</Text>
      </SettingsScreenShell>
    );
  }

  const supportMessage = getNotificationsSupportMessage();

  return (
    <SettingsScreenShell
      title="Notifications"
      subtitle="Gentle local reminders — never ads or marketing."
    >
      {supportMessage ? (
        <Text variant="bodyMuted" style={styles.denied}>
          {supportMessage}
        </Text>
      ) : null}

      <Text variant="bodyMuted">
        Permission status: {permissionStatus}
        {!areNotificationsSupported() ? ' (scheduling unavailable)' : ''}
      </Text>

      {permissionStatus !== 'granted' ? (
        <>
          <Text variant="body">
            Enable notifications to receive breakfast, meal, workout, and coaching reminders.
          </Text>
          <Button label="Enable notifications" onPress={() => void handlePermission()} />
        </>
      ) : null}

      {reminders.map((reminder) => (
        <ReminderTimeRow
          key={reminder.id}
          reminder={reminder}
          onToggle={() => void patchReminder(reminder.type, { enabled: !reminder.enabled })}
          onTimeChange={(hour, minute) => void patchReminder(reminder.type, { hour, minute })}
        />
      ))}

      {permissionStatus === 'denied' ? (
        <Text variant="bodyMuted" style={styles.denied}>
          Notifications are denied. Open system settings to re-enable them.
        </Text>
      ) : null}
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  denied: {
    color: colors.brandPrimary,
    lineHeight: 22,
  },
});
