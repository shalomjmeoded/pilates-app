import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/theme';

interface LoadErrorStateProps {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function LoadErrorState({
  title = 'Couldn’t load this section',
  message = 'Something went wrong while loading your data. Please try again.',
  retryLabel = 'Try again',
  onRetry,
  compact = false,
}: LoadErrorStateProps) {
  return (
    <Card style={[styles.card, compact && styles.compact]}>
      <Text variant={compact ? 'label' : 'h2'}>{title}</Text>
      <Text variant="bodyMuted" style={styles.copy}>
        {message}
      </Text>
      {onRetry ? (
        <View style={compact ? styles.compactAction : styles.action}>
          <Button label={retryLabel} variant={compact ? 'secondary' : 'primary'} onPress={onRetry} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  compact: {
    padding: spacing.xs,
  },
  copy: {
    lineHeight: 22,
  },
  action: {
    marginTop: spacing.sm,
  },
  compactAction: {
    marginTop: spacing.xs,
  },
});
