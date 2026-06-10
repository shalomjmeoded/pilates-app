import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

export function WorkoutsOnlyState() {
  return (
    <View style={styles.wrap}>
      <Text variant="h2">Workouts-only mode</Text>
      <Text variant="bodyMuted" style={styles.copy}>
        You chose to focus on movement during onboarding. Enable full nutrition tracking in
        Settings when you&apos;re ready.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    gap: spacing.xs,
  },
  copy: {
    marginTop: spacing.xs,
  },
});
