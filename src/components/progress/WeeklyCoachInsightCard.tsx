import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadErrorState } from '@/components/ui/LoadErrorState';
import { Text } from '@/components/ui/Text';
import { useDelayedLoadingMessage } from '@/hooks/useDelayedLoadingMessage';
import type { WeeklyCoachInsightContent } from '@/types/coaching';
import { colors, radius, spacing, createDynamicStyles } from '@/theme';

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
  const [expanded, setExpanded] = useState(false);
  const loadingMessage = useDelayedLoadingMessage(isLoading);

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
            <Text variant="body" style={styles.summaryText} numberOfLines={2}>
              {insight.summary}
            </Text>
            {!expanded ? (
              <Text variant="caption" style={styles.expandHint}>View weekly guidance</Text>
            ) : null}
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
          {insight.wins.length > 0 ? (
            <View style={styles.winsWrap}>
              <Text variant="label" style={styles.sectionLabel}>This week’s wins</Text>
              {insight.wins.map((win) => (
                <View key={win} style={styles.winRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
                  <Text variant="body" style={styles.rowText}>{win}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <CoachGuidanceRow
            icon="target"
            label="Next focus"
            body={insight.focusForNextWeek}
            color={colors.brandPrimary}
          />
          <CoachGuidanceRow
            icon="food-apple-outline"
            label="Nutrition"
            body={insight.nutritionTip}
            color={colors.accentWarm}
          />
          {insight.targetAdjustmentSummary ? (
            <CoachGuidanceRow
              icon="tune-vertical"
              label="Target update"
              body={insight.targetAdjustmentSummary}
              color={colors.brandPrimary}
            />
          ) : null}
          <CoachGuidanceRow
            icon="yoga"
            label="Movement"
            body={insight.workoutTip}
            color={colors.accentCool}
          />
          <Text variant="bodyMuted">
            Source: {insight.source === 'ai' ? 'AI coach' : 'Local coach fallback'}
          </Text>
        </View>
      ) : null}

      {error ? (
        <LoadErrorState
          title="Couldn’t load coach summary"
          message={error}
          compact
          onRetry={onGenerate}
          retryLabel="Refresh"
        />
      ) : null}

      {loadingMessage ? (
        <Text variant="bodyMuted" style={styles.loadingMessage} accessibilityLiveRegion="polite">
          {loadingMessage}
        </Text>
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

function CoachGuidanceRow({
  icon,
  label,
  body,
  color,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  body: string;
  color: string;
}) {
  return (
    <View style={styles.guidanceRow}>
      <View style={[styles.guidanceIcon, { backgroundColor: `${color}18` }]}>
        <MaterialCommunityIcons name={icon} size={17} color={color} />
      </View>
      <View style={styles.guidanceCopy}>
        <Text variant="label" style={styles.sectionLabel}>{label}</Text>
        <Text variant="body" style={styles.rowText}>{body}</Text>
      </View>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
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
  loadingMessage: {
    color: colors.brandSecondaryText,
    textAlign: 'center',
  },
  section: {
    gap: spacing.sm,
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
    lineHeight: 20,
  },
  expandHint: {
    color: colors.brandPrimary,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  winsWrap: {
    gap: 6,
  },
  winRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  guidanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
    paddingTop: spacing.xs,
  },
  guidanceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidanceCopy: {
    flex: 1,
    gap: 2,
  },
  sectionLabel: {
    color: colors.textMuted,
  },
  rowText: {
    flex: 1,
    lineHeight: 20,
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
}));
