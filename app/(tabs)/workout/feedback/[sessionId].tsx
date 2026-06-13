import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { FeedbackSelector } from '@/components/workout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { TuneBootLoader } from '@/components/ui/TuneBootLoader';
import { isFeedbackComplete, useCompleteWorkoutSession } from '@/hooks/useCompleteWorkoutSession';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import type { ExerciseFeedback } from '@/types/exercise';
import { colors, spacing } from '@/theme';

export default function WorkoutFeedbackScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { session, planDate, exercises, isLoading, error } = useWorkoutSession(sessionId);
  const { submit, isSubmitting, error: submitError } = useCompleteWorkoutSession(
    sessionId,
    planDate ?? '',
  );

  const [feedbackMap, setFeedbackMap] = useState<Record<string, ExerciseFeedback | undefined>>({});

  const required = useMemo(
    () => exercises.map((item) => ({ exerciseId: item.exerciseId, sortOrder: item.sortOrder })),
    [exercises],
  );

  const canComplete = isFeedbackComplete(required, feedbackMap);
  const hasUnsavedChanges = Object.values(feedbackMap).some((value) => value !== undefined);

  if (isLoading) {
    return <TuneBootLoader message="Preparing feedback..." />;
  }

  if (error || !session || !planDate) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <SubscreenTopBar />
        <View style={styles.center}>
          <Text variant="h2">Feedback unavailable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleComplete = async () => {
    const success = await submit(feedbackMap);
    if (success) {
      router.replace('/(tabs)/workout');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar hasUnsavedChanges={hasUnsavedChanges} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="h1">You showed up — beautifully</Text>
        <Text variant="bodyMuted" style={styles.subtitle}>
          Share how each movement felt. Your feedback helps Tune adapt with care, not pressure.
        </Text>

        {exercises.map((item, index) => {
          const key = `${item.exerciseId}:${item.sortOrder}`;
          return (
            <Card key={key} style={styles.card}>
              <Text variant="label">Movement {index + 1}</Text>
              <Text variant="h2">{item.exercise.name}</Text>
              <FeedbackSelector
                value={feedbackMap[key]}
                onChange={(value) =>
                  setFeedbackMap((current) => ({
                    ...current,
                    [key]: value,
                  }))
                }
              />
            </Card>
          );
        })}

        {submitError ? (
          <Text variant="body" style={styles.error}>
            {submitError}
          </Text>
        ) : null}

        <Button
          label={isSubmitting ? 'Saving...' : 'Complete Workout'}
          onPress={() => void handleComplete()}
          disabled={!canComplete || isSubmitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    padding: spacing.sm,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xs,
  },
  card: {
    gap: spacing.xs,
  },
  error: {
    color: colors.brandPrimary,
    textAlign: 'center',
  },
});
