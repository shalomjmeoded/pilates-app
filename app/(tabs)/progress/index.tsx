import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {
  AdherenceCard,
  BmiTdeeCards,
  ConsistencyScoreRing,
  CoachingTipCard,
  PhysiqueAssessmentCard,
  WeeklyCoachInsightCard,
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
import { Button } from '@/components/ui/Button';
import { LoadErrorState } from '@/components/ui/LoadErrorState';
import { SettingsRow } from '@/components/settings';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useProgressDashboard } from '@/hooks/useProgressDashboard';
import { usePhysiqueAssessment } from '@/hooks/usePhysiqueAssessment';
import { usePremium } from '@/hooks/usePremium';
import { useWeeklyCoach } from '@/hooks/useWeeklyCoach';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useProgressStore } from '@/stores/progressStore';
import { colors, radius, spacing } from '@/theme';
import type { ProgressDashboardData } from '@/types/progress';

type ProgressSectionKey =
  | 'workoutStreak'
  | 'weeklyCoach'
  | 'weightEmpty'
  | 'weightJourney'
  | 'weightChart'
  | 'weightTrend'
  | 'weightStreak'
  | 'goalProjection'
  | 'coachingTip'
  | 'weightHistory'
  | 'adherence'
  | 'consistency'
  | 'bmiTdee'
  | 'milestones'
  | 'physique'
  | 'logWeightAction';

interface ProgressSignalChipProps {
  label: string;
  value: string;
  accentColor: string;
  surfaceColor: string;
}

function ProgressSignalChip({ label, value, accentColor, surfaceColor }: ProgressSignalChipProps) {
  return (
    <View style={[styles.signalChip, { backgroundColor: surfaceColor }]}>
      <View style={[styles.signalDot, { backgroundColor: accentColor }]} />
      <View style={styles.signalCopy}>
        <Text
          variant="label"
          style={styles.signalLabel}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.76}
        >
          {label}
        </Text>
        <Text variant="body" style={styles.signalValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ProgressPulseHeader({ data }: { data: ProgressDashboardData }) {
  const weightLogLabel = data.weightLogs.length === 1 ? '1 log' : `${data.weightLogs.length} logs`;

  return (
    <View style={styles.pulseHeader}>
      <View style={styles.pulseHeaderCopy}>
        <Text variant="label">Your rhythm</Text>
        <Text variant="bodyMuted">A quick read on the signals that matter most.</Text>
      </View>
      <View style={styles.signalRow}>
        <ProgressSignalChip
          label="Workouts"
          value={`${data.workoutStreak.currentStreak}d streak`}
          accentColor={colors.brandSecondary}
          surfaceColor={colors.surfaceRose}
        />
        <ProgressSignalChip
          label="Consistency"
          value={`${data.consistency.score}%`}
          accentColor={colors.success}
          surfaceColor={colors.surfaceMuted}
        />
        <ProgressSignalChip
          label="Weight"
          value={weightLogLabel}
          accentColor={colors.accentWarm}
          surfaceColor={colors.surfacePeach}
        />
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
  const weightUnit = usePreferencesStore((state) => state.preferences.units.weight);
  const listRef = useRef<FlatList<ProgressSectionKey>>(null);
  const scrollOffsetRef = useRef(0);
  const shouldRestoreScrollRef = useRef(false);
  const hasFocusedOnceRef = useRef(false);

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

    const sections: ProgressSectionKey[] = ['workoutStreak', 'weeklyCoach'];

    if (!hasWeightLogs) {
      sections.push('weightEmpty');
    } else {
      if (data.journey) {
        sections.push('weightJourney');
      }
      sections.push('weightChart', 'weightTrend', 'weightStreak', 'goalProjection');
    }

    sections.push('coachingTip', 'weightHistory', 'adherence', 'consistency');
    if (data.bmi && data.tdee) {
      sections.push('bmiTdee');
    }
    sections.push('milestones', 'physique', 'logWeightAction');
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
      <Screen title="Progress" isLoading loadingLabel="Loading your insights...">
        {null}
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen title="Progress" subtitle="Your analytics at a glance.">
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
      <Screen title="Progress" subtitle="Proof that your rhythm is working.">
        <ProgressPreviewGate />
      </Screen>
    );
  }

  const renderSection = ({ item }: ListRenderItemInfo<ProgressSectionKey>) => {
    switch (item) {
      case 'workoutStreak':
        return <WorkoutStreakCard stats={data.workoutStreak} />;
      case 'weeklyCoach':
        return withSectionLabel(
          'Coach summary',
          colors.brandSecondary,
          <WeeklyCoachInsightCard
            insight={weeklyCoach.insight}
            isLoading={weeklyCoach.isLoading}
            error={weeklyCoach.error}
            highlighted={highlightWeeklyCoach}
            locked={!hasAccess}
            onUnlock={openPaywall}
            onGenerate={() => requirePremium('weekly_coach', () => void weeklyCoach.generate())}
          />,
        );
      case 'weightEmpty':
        return <ProgressEmptyState onLogWeight={openLogWeight} />;
      case 'weightJourney':
        return data.journey
          ? withSectionLabel(
              'Weight journey',
              colors.accentCool,
              <WeightJourneyHeroCard journey={data.journey} weightUnit={weightUnit} />,
            )
          : null;
      case 'weightChart':
        return (
          <WeightChart
            logs={data.weightLogs}
            goalWeightKg={data.goalWeightKg}
            range={chartRange}
            onRangeChange={setChartRange}
            weightUnit={weightUnit}
          />
        );
      case 'weightTrend':
        return <WeightTrendSummary trends={data.weightTrends} weightUnit={weightUnit} />;
      case 'weightStreak':
        return <WeightStreakCard stats={data.weightStreak} />;
      case 'goalProjection':
        return <GoalProjectionCard projection={data.goalProjection} />;
      case 'coachingTip':
        return <CoachingTipCard tip={data.coachingTip} />;
      case 'weightHistory':
        return (
          <SettingsRow
            label="Weight history"
            value="Edit, search, delete"
            onPress={() => router.push('/(tabs)/progress/weight-history')}
          />
        );
      case 'adherence':
        return withSectionLabel(
          'Nutrition adherence',
          colors.accentWarm,
          <View style={styles.adherenceGrid}>
            <View style={styles.adherenceGridItem}>
              <AdherenceCard metric={data.adherence.calories} />
            </View>
            <View style={styles.adherenceGridItem}>
              <AdherenceCard metric={data.adherence.protein} />
            </View>
            <View style={styles.adherenceGridItemWide}>
              <AdherenceCard metric={data.adherence.fiber} />
            </View>
          </View>,
        );
      case 'consistency':
        return <ConsistencyScoreRing consistency={data.consistency} />;
      case 'bmiTdee':
        return data.bmi && data.tdee ? (
          <BmiTdeeCards
            bmi={data.bmi}
            tdee={data.tdee}
            bodyFatAssumption={data.bodyFatAssumption}
          />
        ) : null;
      case 'milestones':
        return withSectionLabel(
          'Milestones',
          colors.brandSecondary,
          <MilestoneGrid milestones={data.milestones} />,
          { collapsible: true, initiallyExpanded: false },
        );
      case 'physique':
        return withSectionLabel(
          'Physique check-in',
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
          { collapsible: true, initiallyExpanded: false },
        );
      case 'logWeightAction':
        return <Button label="Log Weight" onPress={openLogWeight} style={styles.logButton} />;
      default:
        return null;
    }
  };

  return (
    <Screen title="Progress" subtitle="Reflect on your rhythm and momentum.">
      <FlatList
        ref={listRef}
        data={sectionKeys}
        keyExtractor={(item) => item}
        renderItem={renderSection}
        ListHeaderComponent={<ProgressPulseHeader data={data} />}
        style={styles.list}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        removeClippedSubviews
        scrollEventThrottle={16}
        initialNumToRender={6}
        maxToRenderPerBatch={5}
        windowSize={7}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  scroll: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  pulseHeader: {
    gap: 8,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
  },
  pulseHeaderCopy: {
    gap: 2,
  },
  signalRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  signalChip: {
    flex: 1,
    minHeight: 64,
    borderRadius: radius.square,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: spacing.xs,
    gap: 6,
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  signalCopy: {
    gap: 1,
  },
  signalLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  signalValue: {
    color: colors.textStrong,
    fontSize: 14,
    lineHeight: 18,
  },
  sectionBlock: {
    gap: spacing.xs,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 32,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    backgroundColor: colors.surfaceCanvas,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionLabelButton: {
    backgroundColor: colors.surfaceRose,
  },
  sectionLabelLine: {
    width: 18,
    height: 3,
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
  adherenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  adherenceGridItem: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  adherenceGridItemWide: {
    flexBasis: '100%',
  },
  logButton: {
    marginTop: spacing.xs,
  },
});
