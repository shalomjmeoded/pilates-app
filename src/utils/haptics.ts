import * as Haptics from 'expo-haptics';

let lastSelectionTick = 0;

export function selectionHaptic(): void {
  const now = Date.now();
  if (now - lastSelectionTick < 40) {
    return;
  }
  lastSelectionTick = now;
  void Haptics.selectionAsync().catch(() => {});
}

export function lightImpactHaptic(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function successNotificationHaptic(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
