import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';

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
import { spacing } from '@/theme';

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

  const openLogWeight = () => {
    router.push('/modals/log-weight');
  };

  useFocusEffect(
    useCallback(() => {
      void reload();
      void weeklyCoach.load();
      void physiqueAssessment.load();
    }, [reload, weeklyCoach.load, physiqueAssessment.load]),
  );

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
        return (
          <WeeklyCoachInsightCard
            insight={weeklyCoach.insight}
            isLoading={weeklyCoach.isLoading}
            error={weeklyCoach.error}
            highlighted={highlightWeeklyCoach}
            locked={!hasAccess}
            onUnlock={openPaywall}
            onGenerate={() => requirePremium('weekly_coach', () => void weeklyCoach.generate())}
          />
        );
      case 'weightEmpty':
        return <ProgressEmptyState onLogWeight={openLogWeight} />;
      case 'weightJourney':
        return data.journey ? <WeightJourneyHeroCard journey={data.journey} weightUnit={weightUnit} /> : null;
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
        return (
          <View style={styles.adherenceRow}>
            <AdherenceCard metric={data.adherence.calories} />
            <AdherenceCard metric={data.adherence.protein} />
            <AdherenceCard metric={data.adherence.fiber} />
          </View>
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
        return <MilestoneGrid milestones={data.milestones} />;
      case 'physique':
        return (
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
          />
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
        data={sectionKeys}
        keyExtractor={(item) => item}
        renderItem={renderSection}
        style={styles.list}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
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
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  adherenceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  logButton: {
    marginTop: spacing.xs,
  },
});
