import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/theme';

interface ResumeWorkoutBannerProps {
  exerciseLabel: string;
  onResume: () => void;
  onDiscard: () => void;
}

export function ResumeWorkoutBanner({ exerciseLabel, onResume, onDiscard }: ResumeWorkoutBannerProps) {
  return (
    <Card style={styles.card} accessibilityRole="alert">
      <Text variant="h2">Resume your workout</Text>
      <Text variant="bodyMuted" style={styles.copy}>
        Pick up where you left off at {exerciseLabel}.
      </Text>
      <View style={styles.actions}>
        <Button label="Resume" onPress={onResume} style={styles.button} />
        <Button label="Discard" variant="secondary" onPress={onDiscard} style={styles.button} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  copy: {
    lineHeight: 22,
  },
  actions: {
    gap: spacing.xs,
  },
  button: {
    minHeight: 44,
  },
});
