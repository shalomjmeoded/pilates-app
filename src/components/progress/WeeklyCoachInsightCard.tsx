import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadErrorState } from '@/components/ui/LoadErrorState';
import { Text } from '@/components/ui/Text';
import type { WeeklyCoachInsightContent } from '@/types/coaching';
import { colors, radius, spacing } from '@/theme';

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
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (insight) {
      setExpanded(true);
    }
  }, [insight]);

  if (locked) {
    return (
      <Card style={[styles.card, highlighted && styles.highlighted]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons name="star-four-points" size={17} color={colors.brandPrimary} />
          </View>
          <View style={styles.headerCopy}>
            <Text variant="label" style={styles.headerLabel}>Weekly AI Coach</Text>
            <Text variant="bodyMuted">Your coaching report is ready.</Text>
          </View>
        </View>
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
      {insight ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Collapse weekly AI coach' : 'Expand weekly AI coach'}
          onPress={() => setExpanded((current) => !current)}
          style={({ pressed }) => [styles.summaryHeader, pressed && styles.pressed]}
        >
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons name="star-four-points" size={17} color={colors.brandPrimary} />
          </View>
          <View style={styles.summaryHeaderCopy}>
            <Text variant="label" style={styles.headerLabel}>Weekly AI coach</Text>
            <Text variant="body" style={styles.summaryText} numberOfLines={expanded ? undefined : 1}>
              {insight.summary}
            </Text>
          </View>
          <View style={styles.chevronBadge}>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={22}
              color={colors.brandPrimary}
            />
          </View>
        </Pressable>
      ) : (
        <View style={styles.cardHeader}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons name="star-four-points" size={17} color={colors.brandPrimary} />
          </View>
          <View style={styles.headerCopy}>
            <Text variant="label" style={styles.headerLabel}>Weekly AI coach</Text>
            <Text variant="bodyMuted">
              Summary-only insights from your week — never your full meal or workout history.
            </Text>
          </View>
        </View>
      )}

      {insight && expanded ? (
        <View style={styles.section}>
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
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceCanvas,
  },
  highlighted: {
    borderColor: colors.brandPrimary,
    borderWidth: 1,
  },
  section: {
    gap: spacing.xs,
    borderRadius: radius.square,
    backgroundColor: colors.surfaceRose,
    padding: spacing.sm,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    borderRadius: radius.square,
    backgroundColor: colors.surfacePeach,
    padding: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerLabel: {
    color: colors.brandPrimary,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfacePeach,
    borderWidth: 1,
    borderColor: colors.accentWarm,
  },
  chevronBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCanvas,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  summaryHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  summaryText: {
    color: colors.textStrong,
  },
  pressed: {
    opacity: 0.82,
  },
  lockedPreview: {
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.surfaceRose,
  },
  blurredText: {
    opacity: 0.35,
  },
  lockOverlay: {
    marginTop: spacing.xs,
  },
});
