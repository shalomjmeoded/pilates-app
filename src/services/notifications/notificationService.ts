import { AppState, type AppStateStatus } from 'react-native';

import { getReminders } from '@/db/repositories/remindersRepository';
import { logSettingChange } from '@/db/repositories/settingsAuditRepository';
import type { Reminder, ReminderType } from '@/types/settings';
import { REMINDER_LABELS, REMINDER_MESSAGES } from '@/types/settings';

import {
  areNotificationsSupported,
  getNotificationsModule,
  type NotificationPermissionStatus,
} from './notificationsCompat';

const REMINDER_ROUTES: Record<ReminderType, string> = {
  breakfast: '/(tabs)/nutrition',
  lunch: '/(tabs)/nutrition',
  dinner: '/(tabs)/nutrition',
  workout: '/(tabs)/workout',
  coaching_tip: '/(tabs)/progress',
};

let handlerConfigured = false;
let appStateSubscription: { remove: () => void } | null = null;

function ensureHandler(): boolean {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return false;
  }

  if (handlerConfigured) {
    return true;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  handlerConfigured = true;
  return true;
}

function reminderIdentifier(type: ReminderType): string {
  return `tune_reminder_${type}`;
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const Notifications = getNotificationsModule();
  if (!Notifications || !ensureHandler()) {
    return 'undetermined';
  }

  const settings = await Notifications.getPermissionsAsync();
  return settings.status;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = getNotificationsModule();
  if (!Notifications || !ensureHandler()) {
    return false;
  }

  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  await logSettingChange('notification_permission', current.status, requested.status);
  return requested.granted;
}

export async function cancelAllScheduledReminders(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications || !ensureHandler()) {
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleReminder(reminder: Reminder): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications || !ensureHandler()) {
    return;
  }

  const identifier = reminderIdentifier(reminder.type);

  await Notifications.cancelScheduledNotificationAsync(identifier);

  if (!reminder.enabled) {
    return;
  }

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: REMINDER_LABELS[reminder.type],
      body: REMINDER_MESSAGES[reminder.type],
      sound: true,
      data: {
        route: REMINDER_ROUTES[reminder.type],
        reminderType: reminder.type,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminder.hour,
      minute: reminder.minute,
    },
  });
}

export async function syncAllReminders(): Promise<void> {
  if (!areNotificationsSupported()) {
    return;
  }

  if (!ensureHandler()) {
    return;
  }

  const reminders = await getReminders();
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

  const permission = await Notifications.getPermissionsAsync();

  if (!permission.granted) {
    await cancelAllScheduledReminders();
    return;
  }

  await cancelAllScheduledReminders();

  for (const reminder of reminders) {
    if (reminder.enabled) {
      await scheduleReminder(reminder);
    }
  }
}

export function registerNotificationLifecycle(): () => void {
  if (!areNotificationsSupported()) {
    return () => {};
  }

  if (!ensureHandler()) {
    return () => {};
  }

  if (appStateSubscription) {
    appStateSubscription.remove();
  }

  const handleAppState = (state: AppStateStatus) => {
    if (state === 'active') {
      void syncAllReminders();
    }
  };

  appStateSubscription = AppState.addEventListener('change', handleAppState);
  void syncAllReminders();

  return () => {
    appStateSubscription?.remove();
    appStateSubscription = null;
  };
}

const WEEKLY_COACH_NOTIFICATION_ID = 'tune_weekly_coach_ready';

export async function notifyWeeklyCoachReady(summary: string): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications || !ensureHandler()) {
    return;
  }

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: WEEKLY_COACH_NOTIFICATION_ID,
    content: {
      title: 'Your weekly coach summary',
      body: summary,
      sound: true,
      data: {
        route: '/(tabs)/progress',
        focus: 'weekly_coach',
      },
    },
    trigger: null,
  });
}

export { areNotificationsSupported, getNotificationsSupportMessage } from './notificationsCompat';
