import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { TuneBootLoader } from '@/components/ui/TuneBootLoader';
import { getSessionFeedback } from '@/db/repositories/workoutRepository';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import type { ExerciseFeedback } from '@/types/exercise';
import type { WorkoutSessionExerciseFeedback } from '@/types/workout';
import { colors, spacing } from '@/theme';

export default function WorkoutFeedbackScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { session, planDate, exercises, isLoading, error } = useWorkoutSession(sessionId);
  const [feedback, setFeedback] = useState<WorkoutSessionExerciseFeedback[]>([]);

  useEffect(() => {
    if (!session) {
      return;
    }
    void getSessionFeedback(session.id).then(setFeedback);
  }, [session]);

  if (isLoading) {
    return <TuneBootLoader message="Saving your session..." />;
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

  const counts = buildFeedbackCounts(feedback);
  const totalTracked = counts.completed + counts.skipped + counts.modified;

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar
        onPress={() => router.replace('/(tabs)/workout')}
        accessibilityLabel="Return to workout tab"
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="h1">You showed up — beautifully</Text>
        <Text variant="bodyMuted" style={styles.subtitle}>
          Your workout actions were saved as you moved, so there is nothing to remember now.
        </Text>

        <Card style={styles.card}>
          <Text variant="label">Session summary</Text>
          <View style={styles.summaryGrid}>
            <SummaryMetric label="Completed" value={counts.completed} />
            <SummaryMetric label="Skipped" value={counts.skipped} />
            <SummaryMetric label="Switched" value={counts.modified} />
          </View>
          <Text variant="bodyMuted">
            {totalTracked} of {exercises.length} movements tracked.
          </Text>
        </Card>

        <Button
          label="Done"
          onPress={() => router.replace('/(tabs)/workout')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function buildFeedbackCounts(feedback: WorkoutSessionExerciseFeedback[]): Record<ExerciseFeedback, number> {
  return feedback.reduce<Record<ExerciseFeedback, number>>(
    (counts, item) => ({
      ...counts,
      [item.feedback]: counts[item.feedback] + 1,
    }),
    { completed: 0, skipped: 0, modified: 0 },
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text variant="h2" style={styles.metricValue}>
        {value}
      </Text>
      <Text
        variant="label"
        style={styles.metricLabel}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {label}
      </Text>
    </View>
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
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metric: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    color: colors.brandPrimary,
  },
  metricLabel: {
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0,
  },
});
