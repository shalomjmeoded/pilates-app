import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { SAFETY_WARNING_MESSAGE } from '@/engines/calculations';
import { colors, radius, spacing } from '@/theme';

interface CalorieSafetyBannerProps {
  threshold: number;
}

export function CalorieSafetyBanner({ threshold }: CalorieSafetyBannerProps) {
  return (
    <View style={styles.banner}>
      <Text variant="label" style={styles.title}>
        Calorie target is very low
      </Text>
      <Text variant="body" style={styles.copy}>
        {SAFETY_WARNING_MESSAGE}
      </Text>
      <Text variant="bodyMuted" style={styles.threshold}>
        Recommended minimum for your profile: {threshold} kcal
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FCE8EC',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    color: colors.brandPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  copy: {
    color: colors.textDark,
    lineHeight: 22,
  },
  threshold: {
    marginTop: 4,
  },
});
