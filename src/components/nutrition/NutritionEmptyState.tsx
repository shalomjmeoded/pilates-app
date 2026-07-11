import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing } from '@/theme';

export function NutritionEmptyState({ onAddMeal }: { onAddMeal: () => void }) {
  return (
    <View style={styles.wrap}>
      <Text variant="body" style={styles.title}>
        No meals logged yet
      </Text>
      <Text variant="bodyMuted" style={styles.copy}>
        Add your first meal to see today’s nutrition balance.
      </Text>
      <Button label="Log your first meal" onPress={onAddMeal} style={styles.button} />
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
  button: {
    alignSelf: 'stretch',
  },
});
