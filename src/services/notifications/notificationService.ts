import { AppState, type AppStateStatus } from 'react-native';

import { enableAllReminders, getReminders } from '@/db/repositories/remindersRepository';
import { getPremiumStatus } from '@/db/repositories/premiumRepository';
import { logSettingChange } from '@/db/repositories/settingsAuditRepository';
import { hasPremiumAccess } from '@/engines/monetization/premiumAccess';
import { preferencesStorage } from '@/storage/mmkv';
import type { FitnessGoal } from '@/types/profile';
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

export interface PaywallNudgeContext {
  fitnessGoal: FitnessGoal;
  weightDeltaLabel?: string;
}

interface PaywallNudge {
  identifier: string;
  delaySeconds: number;
  title: string;
  body: string;
}

const PAYWALL_NUDGE_IDENTIFIERS = [
  'betterme_onboarding_subscription_nudge_1',
  'betterme_onboarding_subscription_nudge_2',
  'betterme_onboarding_subscription_nudge_3',
] as const;

const PAYWALL_NUDGE_DELAYS_SECONDS = [3 * 60 * 60, 24 * 60 * 60, 72 * 60 * 60] as const;

const GENERIC_PAYWALL_NUDGE_COPY: Array<{ title: string; body: string }> = [
  {
    title: 'Your Form: Pilates Studio plan is ready',
    body: "Unlock your AI-powered Pilates and nutrition coach when you're ready to begin.",
  },
  {
    title: 'Your first plan is waiting',
    body: 'Start your personalized Pilates and nutrition rhythm with Form: Pilates Studio.',
  },
  {
    title: 'Begin when it feels right',
    body: 'Your Form: Pilates Studio coach is ready to help you turn your plan into progress.',
  },
];

function buildPaywallNudgeCopy(
  context?: PaywallNudgeContext,
): Array<{ title: string; body: string }> {
  if (!context) {
    return GENERIC_PAYWALL_NUDGE_COPY;
  }

  const { fitnessGoal, weightDeltaLabel } = context;

  switch (fitnessGoal) {
    case 'lose_weight': {
      const goalPhrase = weightDeltaLabel ? `lose ${weightDeltaLabel}` : 'lose the weight';
      return [
        {
          title: `Your plan to ${goalPhrase} is ready`,
          body: 'Everything is set — your Pilates sessions and nutrition targets are waiting for you.',
        },
        {
          title: "Don't give up on your goal",
          body: `You took the first step yesterday. Your personalized plan to ${goalPhrase} is still here.`,
        },
        {
          title: `${weightDeltaLabel ? `${weightDeltaLabel} lighter` : 'A lighter you'} starts with day one`,
          body: 'Your plan adapts to your pace. Begin whenever you feel ready — it only takes one tap.',
        },
      ];
    }
    case 'get_toned':
      return [
        {
          title: 'Your toning plan is ready',
          body: 'Sculpting sessions and nutrition targets built just for you are waiting.',
        },
        {
          title: "Don't give up on getting toned",
          body: 'You already built your plan — the daily Pilates rhythm that shapes results is one tap away.',
        },
        {
          title: 'A stronger, toned you is still waiting',
          body: 'Your personalized program adapts to your pace. Start when it feels right.',
        },
      ];
    case 'build_muscle':
      return [
        {
          title: 'Your strength plan is ready',
          body: 'Muscle-building sessions and fueling targets tailored to you are waiting.',
        },
        {
          title: "Don't give up on building strength",
          body: `Your plan${weightDeltaLabel ? ` to gain ${weightDeltaLabel}` : ''} is built and ready — one tap to begin.`,
        },
        {
          title: 'Stronger starts with session one',
          body: 'Your personalized program adapts as you progress. Begin whenever you are ready.',
        },
      ];
    case 'maintain':
      return [
        {
          title: 'Your consistency plan is ready',
          body: 'A steady Pilates and nutrition rhythm built around your life is waiting.',
        },
        {
          title: "Don't lose the momentum you started",
          body: 'You built your plan yesterday — your daily rhythm is one tap away.',
        },
        {
          title: 'Consistency beats intensity',
          body: 'Your personalized program is still here, ready when you are.',
        },
      ];
  }
}

function buildPaywallNudgeSequence(context?: PaywallNudgeContext): PaywallNudge[] {
  const copy = buildPaywallNudgeCopy(context);
  return PAYWALL_NUDGE_IDENTIFIERS.map((identifier, index) => ({
    identifier,
    delaySeconds: PAYWALL_NUDGE_DELAYS_SECONDS[index],
    title: copy[index].title,
    body: copy[index].body,
  }));
}

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

  for (const type of Object.keys(REMINDER_ROUTES) as ReminderType[]) {
    await Notifications.cancelScheduledNotificationAsync(reminderIdentifier(type));
  }
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

  for (const identifier of PAYWALL_NUDGE_IDENTIFIERS) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }
}

export async function scheduleOnboardingPaywallNudge(
  context?: PaywallNudgeContext,
): Promise<void> {
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

  await cancelOnboardingPaywallNudge();

  for (const nudge of buildPaywallNudgeSequence(context)) {
    await Notifications.scheduleNotificationAsync({
      identifier: nudge.identifier,
      content: {
        title: nudge.title,
        body: nudge.body,
        sound: true,
        data: {
          route: '/onboarding/step-00-welcome',
          source: 'onboarding_paywall_nudge',
          sequenceId: nudge.identifier,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: nudge.delaySeconds,
      },
    });
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
