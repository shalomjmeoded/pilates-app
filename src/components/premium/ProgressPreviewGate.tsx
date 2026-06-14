import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { LockedPreviewCard } from '@/components/premium/LockedPreviewCard';
import { PaywallHero } from '@/components/premium/PaywallHero';
import { Text } from '@/components/ui/Text';
import { usePremium } from '@/hooks/usePremium';
import { colors, radius, shadows, spacing } from '@/theme';

interface ProgressPreviewGateProps {
  onStartTrial?: () => void;
  onRestore?: () => void;
}

function PreviewTrendChart() {
  return (
    <View style={styles.chartWrap}>
      <Svg width="100%" height={100} viewBox="0 0 280 100" preserveAspectRatio="none">
        <Path
          d="M0,72 C40,68 60,55 100,58 S180,38 220,42 S260,28 280,24"
          stroke={colors.brandSecondary}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M0,72 C40,68 60,55 100,58 S180,38 220,42 S260,28 280,24 L280,100 L0,100 Z"
          fill={colors.surfaceRose}
          opacity={0.45}
        />
      </Svg>
    </View>
  );
}

function PreviewConsistencyRing() {
  return (
    <View style={styles.ringWrap}>
      <View style={styles.ringOuter}>
        <Text variant="display" style={styles.ringScore}>
          78
        </Text>
        <Text variant="caption">consistency</Text>
      </View>
    </View>
  );
}

export function ProgressPreviewGate({ onStartTrial, onRestore }: ProgressPreviewGateProps) {
  const { restore, openPaywall } = usePremium();

  const handleStartTrial = () => {
    if (onStartTrial) {
      onStartTrial();
      return;
    }
    openPaywall();
  };

  const handleRestore = () => {
    if (onRestore) {
      onRestore();
      return;
    }
    void restore();
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.intro}>
        <Text variant="section">Proof you&apos;re building momentum</Text>
        <Text variant="bodyMuted">
          BetterMe turns your workouts, meals, and weigh-ins into calm, encouraging insights — never
          shame.
        </Text>
      </View>

      <View style={[styles.proofCard, shadows.card]}>
        <Text variant="label">Consistency score</Text>
        <PreviewConsistencyRing />
        <Text variant="bodyMuted" style={styles.proofCaption}>
          See how rhythm across movement and nutrition adds up each week.
        </Text>
      </View>

      <LockedPreviewCard eyebrow="Weight journey">
        <View style={styles.lockedInner}>
          <Text variant="h2">Trending gently toward your goal</Text>
          <PreviewTrendChart />
          <Text variant="bodyMuted">7-day avg · 30-day avg · goal projection</Text>
        </View>
      </LockedPreviewCard>

      <LockedPreviewCard eyebrow="Weekly coach insight">
        <View style={styles.lockedInner}>
          <Text variant="h2">A thoughtful week of progress</Text>
          <Text variant="body">• You showed up for 3 movement sessions</Text>
          <Text variant="body">• Protein rhythm improved mid-week</Text>
          <Text variant="bodyMuted">Focus next week: gentle evening meals</Text>
        </View>
      </LockedPreviewCard>

      <LockedPreviewCard eyebrow="Milestones" lockLabel="See milestones with free trial">
        <View style={styles.milestoneRow}>
          {['First week', '10 sessions', 'Protein streak'].map((label) => (
            <View key={label} style={styles.milestoneChip}>
              <Text variant="label">{label}</Text>
            </View>
          ))}
        </View>
      </LockedPreviewCard>

      <PaywallHero compact onStartTrial={handleStartTrial} onRestore={handleRestore} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  intro: {
    gap: spacing.xs,
  },
  proofCard: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  proofCaption: {
    textAlign: 'center',
    maxWidth: 300,
  },
  ringWrap: {
    paddingVertical: spacing.xs,
  },
  ringOuter: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 10,
    borderColor: colors.accentCool,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    gap: 2,
  },
  ringScore: {
    color: colors.brandPrimary,
    fontSize: 42,
    lineHeight: 46,
  },
  lockedInner: {
    padding: spacing.sm,
    gap: spacing.xs,
  },
  chartWrap: {
    height: 100,
    marginVertical: spacing.xs,
  },
  milestoneRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  milestoneChip: {
    backgroundColor: colors.surfaceRose,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
});
