import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

export function NutritionEmptyState() {
  return (
    <View style={styles.wrap}>
      <Text variant="body" style={styles.title}>
        No meals logged yet
      </Text>
      <Text variant="bodyMuted" style={styles.copy}>
        Tap Add Meal above to log your first entry for this day.
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
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  copy: {
    textAlign: 'center',
  },
});
