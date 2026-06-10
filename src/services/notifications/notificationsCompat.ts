import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type NotificationPermissionStatus = 'undetermined' | 'granted' | 'denied';

type ExpoNotificationsModule = typeof import('expo-notifications');

let cachedModule: ExpoNotificationsModule | null | undefined;

function loadNotificationsModule(): ExpoNotificationsModule | null {
  if (cachedModule !== undefined) {
    return cachedModule;
  }

  if (Constants.appOwnership === 'expo' || Platform.OS === 'web') {
    cachedModule = null;
    return null;
  }

  try {
    // Lazy require — top-level import crashes Expo Go (SDK 53+).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require('expo-notifications') as ExpoNotificationsModule;
    return cachedModule;
  } catch (error) {
    console.warn('[Tune] expo-notifications unavailable.', error);
    cachedModule = null;
    return null;
  }
}

export function areNotificationsSupported(): boolean {
  return loadNotificationsModule() !== null;
}

export function getNotificationsSupportMessage(): string | null {
  if (areNotificationsSupported()) {
    return null;
  }

  if (Constants.appOwnership === 'expo') {
    return 'Local reminders need a development build. Expo Go cannot schedule notifications.';
  }

  if (Platform.OS === 'web') {
    return 'Notifications are unavailable on web.';
  }

  return 'Notifications are unavailable in this environment.';
}

export function getNotificationsModule(): ExpoNotificationsModule | null {
  return loadNotificationsModule();
}
