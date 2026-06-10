import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

interface NutritionScoreBadgeProps {
  score: number;
}

export function NutritionScoreBadge({ score }: NutritionScoreBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text variant="label">Nutrition score</Text>
      <Text variant="h1" style={styles.score}>
        {score}
      </Text>
      <Text variant="bodyMuted">Balanced, not obsessive.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 2,
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  score: {
    color: colors.brandPrimary,
    fontSize: 36,
    lineHeight: 42,
  },
});
