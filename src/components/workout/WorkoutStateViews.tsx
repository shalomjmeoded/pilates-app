import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { PlanGenerationErrorCode } from '@/types/workout';
import { colors, spacing } from '@/theme';

interface WorkoutEmptyStateProps {
  title: string;
  message: string;
}

export function WorkoutEmptyState({ title, message }: WorkoutEmptyStateProps) {
  return (
    <Card style={styles.card}>
      <Text variant="h2">{title}</Text>
      <Text variant="bodyMuted" style={styles.copy}>
        {message}
      </Text>
    </Card>
  );
}

interface WorkoutErrorStateProps {
  code: PlanGenerationErrorCode | null;
  message: string;
  onRetry: () => void;
}

const ERROR_COPY: Partial<Record<PlanGenerationErrorCode, string>> = {
  NO_PROFILE: 'Finish onboarding to unlock personalized workouts.',
  EMPTY_LIBRARY: 'The exercise library is still loading. Pull to refresh or try again in a moment.',
  INSUFFICIENT_EXERCISES: 'Not enough movements are available to build today’s plan.',
  INVALID_LIBRARY_IDS: 'We couldn’t match this workout to the current movement library. Tap Try again to rebuild it.',
  UNKNOWN: 'Something interrupted your workout load. Tap Try again.',
};

export function WorkoutErrorState({ code, message, onRetry }: WorkoutErrorStateProps) {
  return (
    <Card style={styles.card}>
      <Text variant="h2">Couldn’t load workout</Text>
      <Text variant="bodyMuted" style={styles.copy}>
        {code ? ERROR_COPY[code] ?? message : message}
      </Text>
      <View style={styles.action}>
        <Button label="Try again" onPress={onRetry} />
      </View>
    </Card>
  );
}

interface WorkoutReadOnlyBannerProps {
  message: string;
}

export function WorkoutReadOnlyBanner({ message }: WorkoutReadOnlyBannerProps) {
  return (
    <View style={styles.banner}>
      <Text variant="body" style={styles.bannerText}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  copy: {
    marginTop: spacing.xs,
  },
  action: {
    marginTop: spacing.sm,
  },
  banner: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.sm,
  },
  bannerText: {
    color: colors.textMuted,
  },
});
