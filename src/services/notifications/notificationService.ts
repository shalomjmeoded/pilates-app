import { AppState, type AppStateStatus } from 'react-native';

import { enableAllReminders, getReminders } from '@/db/repositories/remindersRepository';
import { getPremiumStatus } from '@/db/repositories/premiumRepository';
import { logSettingChange } from '@/db/repositories/settingsAuditRepository';
import { hasPremiumAccess } from '@/engines/monetization/premiumAccess';
import { preferencesStorage } from '@/storage/mmkv';
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

const REMINDER_DEFAULTS_APPLIED_FLAG = 'notification_reminder_defaults_applied_v1';
const ONBOARDING_PAYWALL_NUDGE_ID = 'betterme_onboarding_subscription_nudge';
const ONBOARDING_PAYWALL_NUDGE_DELAY_SECONDS = 3 * 60 * 60;

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
  return `betterme_reminder_${type}`;
}

async function enableDefaultRemindersAfterPermissionGranted(): Promise<void> {
  const flags = preferencesStorage.getCachedFlags();
  if (flags[REMINDER_DEFAULTS_APPLIED_FLAG] === true) {
    return;
  }

  const reminders = await getReminders();
  if (reminders.every((reminder) => !reminder.enabled)) {
    await enableAllReminders();
  }

  preferencesStorage.setCachedFlag(REMINDER_DEFAULTS_APPLIED_FLAG, true);
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
    await enableDefaultRemindersAfterPermissionGranted();
    await syncAllReminders();
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  await logSettingChange('notification_permission', current.status, requested.status);
  if (requested.granted) {
    await enableDefaultRemindersAfterPermissionGranted();
    await syncAllReminders();
  }
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

  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

  const permission = await Notifications.getPermissionsAsync();

  if (!permission.granted) {
    await cancelAllScheduledReminders();
    return;
  }

  await enableDefaultRemindersAfterPermissionGranted();
  const reminders = await getReminders();

  await cancelAllScheduledReminders();

  for (const reminder of reminders) {
    if (reminder.enabled) {
      await scheduleReminder(reminder);
    }
  }
}

export async function cancelOnboardingPaywallNudge(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications || !ensureHandler()) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(ONBOARDING_PAYWALL_NUDGE_ID);
}

export async function scheduleOnboardingPaywallNudge(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications || !ensureHandler()) {
    return;
  }

  const [permission, premium] = await Promise.all([
    Notifications.getPermissionsAsync(),
    getPremiumStatus(),
  ]);

  if (!permission.granted) {
    return;
  }

  if (hasPremiumAccess(premium)) {
    await cancelOnboardingPaywallNudge();
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(ONBOARDING_PAYWALL_NUDGE_ID);
  await Notifications.scheduleNotificationAsync({
    identifier: ONBOARDING_PAYWALL_NUDGE_ID,
    content: {
      title: 'Your BetterMe plan is ready',
      body: "Unlock your AI-powered Pilates and nutrition coach when you're ready to begin.",
      sound: true,
      data: {
        route: '/onboarding/step-00-welcome',
        source: 'onboarding_paywall_nudge',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: ONBOARDING_PAYWALL_NUDGE_DELAY_SECONDS,
    },
  });
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

const WEEKLY_COACH_NOTIFICATION_ID = 'betterme_weekly_coach_ready';

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
