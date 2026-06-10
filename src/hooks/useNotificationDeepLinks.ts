import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { getNotificationsModule } from '@/services/notifications/notificationsCompat';

function navigateFromNotification(
  router: ReturnType<typeof useRouter>,
  response: { notification: { request: { content: { data?: Record<string, unknown> } } } } | null,
) {
  const route = response?.notification.request.content.data?.route;
  if (typeof route === 'string') {
    router.push(route as never);
  }
}

export function useNotificationDeepLinks(): void {
  const router = useRouter();

  useEffect(() => {
    const Notifications = getNotificationsModule();
    if (!Notifications) {
      return;
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      navigateFromNotification(router, response);
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      navigateFromNotification(router, response);
    });

    return () => subscription.remove();
  }, [router]);
}
