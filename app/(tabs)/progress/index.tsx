import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

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
import { PremiumGate } from '@/components/premium';
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
      <Screen title="Progress" subtitle="Your analytics at a glance.">
        <PremiumGate description="Track weight, adherence, consistency, and milestones with Tune Premium." />
      </Screen>
    );
  }

  const hasWeightLogs = data.weightLogs.length > 0;

  return (
    <Screen title="Progress" subtitle="Reflect on your rhythm and momentum.">
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <WorkoutStreakCard stats={data.workoutStreak} />

        <WeeklyCoachInsightCard
          insight={weeklyCoach.insight}
          isLoading={weeklyCoach.isLoading}
          error={weeklyCoach.error}
          highlighted={highlightWeeklyCoach}
          locked={!hasAccess}
          onUnlock={openPaywall}
          onGenerate={() => requirePremium('weekly_coach', () => void weeklyCoach.generate())}
        />

        {!hasWeightLogs ? (
          <ProgressEmptyState onLogWeight={openLogWeight} />
        ) : (
          <>
            {data.journey ? (
              <WeightJourneyHeroCard journey={data.journey} weightUnit={weightUnit} />
            ) : null}
            <WeightChart
              logs={data.weightLogs}
              goalWeightKg={data.goalWeightKg}
              range={chartRange}
              onRangeChange={setChartRange}
              weightUnit={weightUnit}
            />
            <WeightTrendSummary trends={data.weightTrends} weightUnit={weightUnit} />
            <WeightStreakCard stats={data.weightStreak} />
            <GoalProjectionCard projection={data.goalProjection} />
          </>
        )}

        <CoachingTipCard tip={data.coachingTip} />

        <SettingsRow
          label="Weight history"
          value="Edit, search, delete"
          onPress={() => router.push('/(tabs)/progress/weight-history')}
        />

        <View style={styles.adherenceRow}>
          <AdherenceCard metric={data.adherence.calories} />
          <AdherenceCard metric={data.adherence.protein} />
          <AdherenceCard metric={data.adherence.fiber} />
        </View>
        <ConsistencyScoreRing consistency={data.consistency} />

        {data.bmi && data.tdee ? (
          <BmiTdeeCards
            bmi={data.bmi}
            tdee={data.tdee}
            bodyFatAssumption={data.bodyFatAssumption}
          />
        ) : null}

        <MilestoneGrid milestones={data.milestones} />

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

        <Button label="Log Weight" onPress={openLogWeight} style={styles.logButton} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
