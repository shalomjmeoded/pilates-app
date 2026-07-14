import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors, spacing, createDynamicStyles } from '@/theme';

interface ProgressEmptyStateProps {
  onLogWeight: () => void;
}

export function ProgressEmptyState({ onLogWeight }: ProgressEmptyStateProps) {
  return (
    <Card style={styles.card}>
      <Text variant="h2">Begin your journey</Text>
      <Text variant="bodyMuted" style={styles.copy}>
        Log your first weight to begin tracking progress.
      </Text>
      <Button label="Log Weight" onPress={onLogWeight} style={styles.button} />
    </Card>
  );
}

const styles = createDynamicStyles(() => ({
  card: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  copy: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  button: {
    alignSelf: 'stretch',
  },
}));
