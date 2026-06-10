import { Alert } from 'react-native';

export function confirmDiscardBack(onBack: () => void, hasUnsavedChanges: boolean): void {
  if (!hasUnsavedChanges) {
    onBack();
    return;
  }

  Alert.alert('Discard changes?', undefined, [
    { text: 'Keep editing', style: 'cancel' },
    { text: 'Discard', style: 'destructive', onPress: onBack },
  ]);
}
