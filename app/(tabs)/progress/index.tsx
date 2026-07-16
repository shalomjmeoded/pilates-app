import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { FlatList, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, Pressable, View } from 'react-native';

import {
  BmiTdeeCards,
  ConsistencyScoreRing,
  CoachingTipCard,
  NutritionAdherenceSummary,
  PhysiqueAssessmentCard,
  WeeklyCoachInsightCard,
  WeeklyReportCard,
  GoalProjectionCard,
  MilestoneGrid,
  ProgressEmptyState,
  WeightChart,
  WeightJourneyHeroCard,
  WeightStreakCard,
  WeightTrendSummary,
} from '@/components/progress';
import { WorkoutStreakCard } from '@/components/workout';
import { ProgressPreviewGate } from '@/components/premium';
import { EncouragementBanner } from '@/components/ui/EncouragementBanner';
import { LoadErrorState } from '@/components/ui/LoadErrorState';
import { SettingsRow } from '@/components/settings';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { buildWeeklyReportCard } from '@/engines/coaching/weeklyReportCard';
import { useProgressDashboard } from '@/hooks/useProgressDashboard';
import { usePhysiqueAssessment } from '@/hooks/usePhysiqueAssessment';
import { usePremium } from '@/hooks/usePremium';
import { useWeeklyCoach } from '@/hooks/useWeeklyCoach';
import { useEncouragementStore } from '@/stores/encouragementStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useProgressStore } from '@/stores/progressStore';
import { colors, radius, spacing, createDynamicStyles } from '@/theme';
import type { ProgressDashboardData } from '@/types/progress';
import { warmAiProxy } from '@/services/ai';

type ProgressSectionKey =
  | 'weeklyCoach'
  | 'weightEmpty'
  | 'weightJourney'
  | 'adherence'
  | 'moreInsights'
  | 'physique';

function ProgressPulseHeader({
  data,
  onLogWeight,
}: {
  data: ProgressDashboardData;
  onLogWeight: () => void;
}) {
  const consistency = data.consistency.score;
  const title =
    consistency >= 80
      ? 'A strong week'
      : consistency >= 60
        ? 'Momentum is building'
        : 'Every check-in counts';
  const streak = data.workoutStreak.currentStreak;
  const summary =
    streak > 0
      ? `${streak}-day movement streak · ${consistency}% consistency`
      : `${consistency}% consistency · your next workout starts a new streak`;

  return (
    <View style={styles.pulseHeader}>
      <View style={styles.pulseHeaderTopRow}>
        <View style={styles.pulseHeaderCopy}>
          <Text variant="label">This week</Text>
          <Text variant="h2" style={styles.pulseTitle}>{title}</Text>
          <Text variant="bodyMuted" style={styles.pulseSummary}>{summary}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log weight"
          onPress={onLogWeight}
          style={({ pressed }) => [styles.logWeightQuickAction, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="scale-bathroom" size={17} color={colors.brandPrimary} />
          <Text variant="label" style={styles.logWeightQuickActionText} numberOfLines={1}>
            Log weight
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function SectionLabel({
  title,
  accentColor,
  expanded,
  collapsible,
  onToggle,
}: {
  title: string;
  accentColor: string;
  expanded?: boolean;
  collapsible?: boolean;
  onToggle?: () => void;
}) {
  const content = (
    <>
      <View style={[styles.sectionLabelLine, { backgroundColor: accentColor }]} />
      <Text variant="label" style={styles.sectionLabelText}>
        {title}
      </Text>
      {collapsible ? (
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={19}
          color={colors.textMuted}
          style={styles.sectionChevron}
        />
      ) : null}
    </>
  );

  if (collapsible) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={expanded ? `Collapse ${title}` : `Expand ${title}`}
        onPress={onToggle}
        style={({ pressed }) => [styles.sectionLabel, styles.sectionLabelButton, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={styles.sectionLabel}>
      {content}
    </View>
  );
}

function SectionContainer({
  title,
  accentColor,
  children,
  collapsible = false,
  initiallyExpanded = true,
}: {
  title: string;
  accentColor: string;
  children: ReactNode;
  collapsible?: boolean;
  initiallyExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  return (
    <View style={styles.sectionBlock}>
      <SectionLabel
        title={title}
        accentColor={accentColor}
        collapsible={collapsible}
        expanded={expanded}
        onToggle={() => setExpanded((current) => !current)}
      />
      {expanded ? children : null}
    </View>
  );
}

function withSectionLabel(
  title: string,
  accentColor: string,
  children: ReactNode,
  options?: { collapsible?: boolean; initiallyExpanded?: boolean },
) {
  return (
    <SectionContainer
      title={title}
      accentColor={accentColor}
      collapsible={options?.collapsible}
      initiallyExpanded={options?.initiallyExpanded}
    >
      {children}
    </SectionContainer>
  );
}

export default function ProgressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ focus?: string }>();
  const { data, isLoading, error, reload } = useProgressDashboard();
  const weeklyCoach = useWeeklyCoach();
  const physiqueAssessment = usePhysiqueAssessment();
  const { hasAccess, requirePremium, openPaywall } = usePremium();
  const highlightWeeklyCoach = params.focus === 'weekly_coach';
  const chartRange = useProgressStore((state) => state.chartRange);
  const setChartRange = useProgressStore((state) => state.setChartRange);
  const encouragement = useEncouragementStore((state) => state.message);
  const clearEncouragement = useEncouragementStore((state) => state.clearMessage);
  const weightUnit = usePreferencesStore((state) => state.preferences.units.weight);
  const listRef = useRef<FlatList<ProgressSectionKey>>(null);
  const scrollOffsetRef = useRef(0);
  const shouldRestoreScrollRef = useRef(false);
  const hasFocusedOnceRef = useRef(false);

  useEffect(() => {
    if (hasAccess) {
      void warmAiProxy();
    }
  }, [hasAccess]);

  const openLogWeight = () => {
    router.push('/modals/log-weight');
  };

  useFocusEffect(
    useCallback(() => {
      if (hasFocusedOnceRef.current && scrollOffsetRef.current > 0) {
        shouldRestoreScrollRef.current = true;
      }
      hasFocusedOnceRef.current = true;
      void reload();
      void weeklyCoach.load();
      void physiqueAssessment.load();
    }, [reload, weeklyCoach.load, physiqueAssessment.load]),
  );

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  const hasWeightLogs = Boolean(data?.weightLogs.length);
  const sectionKeys = useMemo(() => {
    if (!data) {
      return [];
    }

    const sections: ProgressSectionKey[] = ['weeklyCoach'];

    if (!hasWeightLogs) {
      sections.push('weightEmpty');
    } else {
      sections.push('weightJourney');
    }

    sections.push('adherence', 'moreInsights', 'physique');
    return sections;
  }, [data, hasWeightLogs]);

  useEffect(() => {
    if (!data || isLoading || !shouldRestoreScrollRef.current || scrollOffsetRef.current <= 0) {
      return;
    }

    const offset = scrollOffsetRef.current;
    shouldRestoreScrollRef.current = false;
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset, animated: false });
    });
  }, [data, isLoading, sectionKeys.length]);

  if (isLoading) {
    return (
      <Screen title="Progress" isLoading loadingLabel="Loading your insights..." showBrandMark>
        {null}
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen title="Progress" subtitle="Your analytics at a glance." showBrandMark>
        <LoadErrorState
          title="Couldn’t load progress"
          message="Your progress data is still safe. Try reloading this screen."
          onRetry={() => void reload()}
        />
      </Screen>
    );
  }

  if (!hasAccess) {
    return (
      <Screen title="Progress" subtitle="Proof that your rhythm is working." showBrandMark>
        <ProgressPreviewGate />
      </Screen>
    );
  }

  const renderSection = ({ item }: ListRenderItemInfo<ProgressSectionKey>) => {
    switch (item) {
      case 'weeklyCoach':
        return withSectionLabel(
          'Coach check-in',
          colors.brandSecondary,
          <View style={styles.sectionStack}>
            <WeeklyCoachInsightCard
              insight={weeklyCoach.insight}
              readiness={weeklyCoach.readiness}
              isLoading={weeklyCoach.isLoading}
              error={weeklyCoach.error}
              highlighted={highlightWeeklyCoach}
              locked={!hasAccess}
              onUnlock={openPaywall}
              onGenerate={() => requirePremium('weekly_coach', () => void weeklyCoach.generate())}
            />
            {weeklyCoach.insight ? (
              <WeeklyReportCard
                data={buildWeeklyReportCard({
                  insight: weeklyCoach.insight,
                  workoutsCompleted: Math.min(
                    7,
                    Math.round((data.consistency.workoutScore / 100) * 4),
                  ),
                  workoutsPlanned: 4,
                  weekLabel: 'Last week',
                  targetAdjustmentSummary: weeklyCoach.insight.targetAdjustmentSummary,
                })}
              />
            ) : null}
          </View>,
        );
      case 'weightEmpty':
        return <ProgressEmptyState onLogWeight={openLogWeight} />;
      case 'weightJourney':
        return withSectionLabel(
          'Weight journey',
          colors.accentCool,
          <View style={styles.sectionStack}>
            {data.journey ? <WeightJourneyHeroCard journey={data.journey} weightUnit={weightUnit} /> : null}
            <WeightChart
              logs={data.weightLogs}
              goalWeightKg={data.goalWeightKg}
              range={chartRange}
              onRangeChange={setChartRange}
              weightUnit={weightUnit}
            />
            <SettingsRow
              label="Weight history"
              value="Edit, search, delete"
              onPress={() => router.push('/(tabs)/progress/weight-history')}
            />
          </View>,
          { collapsible: true, initiallyExpanded: true },
        );
      case 'adherence':
        return withSectionLabel(
          'Nutrition check-in',
          colors.accentWarm,
          <NutritionAdherenceSummary
            calories={data.adherence.calories}
            protein={data.adherence.protein}
            fiber={data.adherence.fiber}
          />,
          { collapsible: true, initiallyExpanded: true },
        );
      case 'moreInsights':
        return withSectionLabel(
          'More insights',
          colors.brandSecondary,
          <View style={styles.detailsStack}>
            <CoachingTipCard tip={data.coachingTip} />
            <WorkoutStreakCard stats={data.workoutStreak} />
            <ConsistencyScoreRing consistency={data.consistency} />
            {hasWeightLogs ? (
              <>
                <WeightTrendSummary trends={data.weightTrends} weightUnit={weightUnit} />
                <WeightStreakCard stats={data.weightStreak} />
                <GoalProjectionCard projection={data.goalProjection} />
              </>
            ) : null}
            {data.bmi && data.tdee ? (
              <BmiTdeeCards
                bmi={data.bmi}
                tdee={data.tdee}
                bodyFatAssumption={data.bodyFatAssumption}
              />
            ) : null}
            <MilestoneGrid milestones={data.milestones} />
          </View>,
          { collapsible: true, initiallyExpanded: false },
        );
      case 'physique':
        return withSectionLabel(
          'Physique assessment',
          '#9B7BB8',
          <PhysiqueAssessmentCard
            latest={physiqueAssessment.latest}
            isLoading={physiqueAssessment.isLoading}
            error={physiqueAssessment.error}
            onOpen={() => router.push('/(tabs)/progress/physique-assessment')}
            onRetry={() => void physiqueAssessment.load()}
            onDelete={
              physiqueAssessment.latest
                ? () => void physiqueAssessment.deleteAssessment(physiqueAssessment.latest!.id)
                : undefined
            }
          />,
        );
      default:
        return null;
    }
  };

  return (
    <Screen title="Progress" subtitle="Your week at a glance." showBrandMark>
      <FlatList
        ref={listRef}
        data={sectionKeys}
        keyExtractor={(item) => item}
        renderItem={renderSection}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            {encouragement?.target === 'progress' ? (
              <EncouragementBanner
                title={encouragement.title}
                body={encouragement.body}
                onDismiss={() => clearEncouragement(encouragement.id)}
              />
            ) : null}
            <ProgressPulseHeader data={data} onLogWeight={openLogWeight} />
          </View>
        }
        style={styles.list}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
      />
    </Screen>
  );
}

const styles = createDynamicStyles(() => ({
  list: {
    flex: 1,
  },
  scroll: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  headerStack: {
    gap: spacing.sm,
  },
  pulseHeader: {
    gap: spacing.xs,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRose,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
  },
  pulseHeaderCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  pulseTitle: {
    color: colors.textStrong,
    fontSize: 21,
    lineHeight: 26,
  },
  pulseSummary: {
    fontSize: 13,
    lineHeight: 18,
  },
  pulseHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logWeightQuickAction: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceCanvas,
    paddingHorizontal: 10,
  },
  logWeightQuickActionText: {
    color: colors.brandPrimary,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionStack: {
    gap: spacing.sm,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: 2,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionLabelButton: {
    backgroundColor: 'transparent',
  },
  sectionLabelLine: {
    width: 4,
    height: 18,
    borderRadius: 999,
  },
  sectionLabelText: {
    color: colors.textMuted,
    flex: 1,
  },
  sectionChevron: {
    marginLeft: 'auto',
  },
  pressed: {
    opacity: 0.86,
  },
  detailsStack: {
    gap: spacing.sm,
  },
}));
