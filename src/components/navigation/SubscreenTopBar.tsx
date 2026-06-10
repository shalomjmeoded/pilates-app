import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';

import { BackButton } from './BackButton';

interface SubscreenTopBarProps {
  hasUnsavedChanges?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function SubscreenTopBar({
  hasUnsavedChanges,
  onPress,
  accessibilityLabel,
}: SubscreenTopBarProps) {
  return (
    <View style={styles.topBar}>
      <BackButton
        hasUnsavedChanges={hasUnsavedChanges}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
});
