import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { BetterMeBootLoader } from '@/components/ui/BetterMeBootLoader';
import { EncouragementBanner } from '@/components/ui/EncouragementBanner';
import { BetterMeBrandMark } from '@/components/ui/BetterMeBrandMark';
import {
  getSessionFeedback,
  saveWorkoutDifficultyRating,
} from '@/db/repositories/workoutRepository';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { useWorkoutStreak } from '@/hooks/useWorkoutStreak';
import type { ExerciseFeedback } from '@/types/exercise';
import type {
  WorkoutDifficultyRating,
  WorkoutSessionExerciseFeedback,
} from '@/types/workout';
import { colors, spacing } from '@/theme';
import { workoutStreakEncouragement } from '@/utils/encouragement';
import { successNotificationHaptic } from '@/utils/haptics';

export default function WorkoutFeedbackScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { session, planDate, exercises, isLoading, error } = useWorkoutSession(sessionId);
  const { stats, reload: reloadStreak } = useWorkoutStreak();
  const [feedback, setFeedback] = useState<WorkoutSessionExerciseFeedback[]>([]);
  const [difficultyRating, setDifficultyRating] = useState<WorkoutDifficultyRating | undefined>();
  const hasCelebrated = useRef(false);

  useEffect(() => {
    if (!session) {
      return;
    }
    void getSessionFeedback(session.id).then(setFeedback);
    setDifficultyRating(session.difficultyRating);
    void reloadStreak();
    if (!hasCelebrated.current) {
      hasCelebrated.current = true;
      successNotificationHaptic();
    }
  }, [reloadStreak, session]);

  if (isLoading) {
    return <BetterMeBootLoader message="Saving your session..." />;
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
  const streakEncouragement = workoutStreakEncouragement(stats?.currentStreak);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar
        onPress={() => router.replace('/(tabs)/workout')}
        accessibilityLabel="Return to workout tab"
      />
      <ScrollView contentContainerStyle={styles.container}>
        <BetterMeBrandMark compact />
        <Text variant="h1">You showed up — beautifully</Text>
        <Text variant="bodyMuted" style={styles.subtitle}>
          Your workout actions were saved as you moved, so there is nothing to remember now.
        </Text>

        {streakEncouragement ? (
          <EncouragementBanner title={streakEncouragement.title} body={streakEncouragement.body} />
        ) : null}

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

        <Card style={styles.difficultyCard}>
          <View style={styles.difficultyHeading}>
            <Text variant="label">How did that feel?</Text>
            {difficultyRating ? <Text variant="caption" style={styles.savedText}>Saved</Text> : null}
          </View>
          <View style={styles.difficultyRow}>
            {DIFFICULTY_OPTIONS.map((option) => {
              const selected = difficultyRating === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setDifficultyRating(option.value);
                    void saveWorkoutDifficultyRating(session.id, option.value);
                  }}
                  style={({ pressed }) => [
                    styles.difficultyOption,
                    selected && styles.difficultyOptionSelected,
                    pressed && styles.difficultyOptionPressed,
                  ]}
                >
                  <Text
                    variant="label"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={selected ? styles.difficultyTextSelected : styles.difficultyText}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text variant="caption">Your next sessions will gently adjust to this response.</Text>
        </Card>

        <Button
          label="Done"
          onPress={() => router.replace('/(tabs)/workout')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const DIFFICULTY_OPTIONS: Array<{ label: string; value: WorkoutDifficultyRating }> = [
  { label: 'Too easy', value: 'too_easy' },
  { label: 'Just right', value: 'just_right' },
  { label: 'Too hard', value: 'too_hard' },
];

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
  difficultyCard: {
    gap: spacing.xs,
    backgroundColor: colors.surfaceCanvas,
  },
  difficultyHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savedText: {
    color: colors.success,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyOption: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 6,
    backgroundColor: colors.backgroundPrimary,
  },
  difficultyOptionSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandPrimary,
  },
  difficultyOptionPressed: {
    opacity: 0.78,
  },
  difficultyText: {
    color: colors.textStrong,
    letterSpacing: 0,
  },
  difficultyTextSelected: {
    color: colors.warmWhite,
    letterSpacing: 0,
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
