import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadErrorState } from '@/components/ui/LoadErrorState';
import { Text } from '@/components/ui/Text';
import type { WeeklyCoachInsightContent } from '@/types/coaching';
import { colors, spacing } from '@/theme';

interface WeeklyCoachInsightCardProps {
  insight: WeeklyCoachInsightContent | null;
  isLoading?: boolean;
  error?: string | null;
  onGenerate: () => void;
  highlighted?: boolean;
  locked?: boolean;
  onUnlock?: () => void;
}

export function WeeklyCoachInsightCard({
  insight,
  isLoading = false,
  error,
  onGenerate,
  highlighted = false,
  locked = false,
  onUnlock,
}: WeeklyCoachInsightCardProps) {
  if (locked) {
    return (
      <Card style={[styles.card, highlighted && styles.highlighted]}>
        <Text variant="label">Weekly AI Coach</Text>
        <Text variant="bodyMuted">Your coaching report is ready.</Text>
        <View style={styles.lockedPreview}>
          <Text variant="h2" style={styles.blurredText}>
            Strong week toward your goal
          </Text>
          <Text variant="body" style={styles.blurredText}>
            • Completed 3 workouts
          </Text>
          <Text variant="body" style={styles.blurredText}>
            • Protein adherence improved
          </Text>
          <View style={styles.lockOverlay}>
            <Text variant="label">Premium preview</Text>
          </View>
        </View>
        <Button label="Unlock Premium" onPress={onUnlock ?? onGenerate} />
      </Card>
    );
  }

  return (
    <Card style={[styles.card, highlighted && styles.highlighted]}>
      <Text variant="label">Weekly AI coach</Text>
      <Text variant="bodyMuted">
        Summary-only insights from your week — never your full meal or workout history.
      </Text>

      {insight ? (
        <View style={styles.section}>
          <Text variant="h2">{insight.summary}</Text>
          {insight.wins.map((win) => (
            <Text key={win} variant="body">
              • {win}
            </Text>
          ))}
          <Text variant="label">Focus next week</Text>
          <Text variant="body">{insight.focusForNextWeek}</Text>
          <Text variant="label">Nutrition tip</Text>
          <Text variant="body">{insight.nutritionTip}</Text>
          <Text variant="label">Workout tip</Text>
          <Text variant="body">{insight.workoutTip}</Text>
          <Text variant="bodyMuted">
            Source: {insight.source === 'ai' ? 'AI coach' : 'Local coach fallback'}
          </Text>
        </View>
      ) : null}

      {error ? (
        <LoadErrorState
          title="Couldn’t load coach summary"
          message="The weekly summary did not load. Try refreshing it."
          compact
          onRetry={onGenerate}
          retryLabel="Refresh"
        />
      ) : null}

      <Button
        label={isLoading ? 'Loading...' : insight ? 'Refresh weekly summary' : 'Generate weekly summary'}
        variant="secondary"
        onPress={onGenerate}
        disabled={isLoading}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    backgroundColor: colors.surfaceMuted,
  },
  highlighted: {
    borderColor: colors.brandPrimary,
    borderWidth: 1,
  },
  section: {
    gap: spacing.xs,
  },
  lockedPreview: {
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.surfaceCanvas,
  },
  blurredText: {
    opacity: 0.35,
  },
  lockOverlay: {
    marginTop: spacing.xs,
  },
});
