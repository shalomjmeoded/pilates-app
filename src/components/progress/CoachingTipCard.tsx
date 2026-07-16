import { StyleSheet } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/theme';

interface CoachingTipCardProps {
  tip: string;
}

export function CoachingTipCard({ tip }: CoachingTipCardProps) {
  return (
    <Card style={styles.card} accessibilityRole="text" accessibilityLabel={`Coaching tip: ${tip}`}>
      <Text variant="label" style={styles.eyebrow}>
        Today&apos;s reflection
      </Text>
      <Text variant="body" style={styles.tip}>
        {tip}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    backgroundColor: colors.surfaceMuted,
  },
  eyebrow: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tip: {
    lineHeight: 22,
    color: colors.textDark,
  },
});
