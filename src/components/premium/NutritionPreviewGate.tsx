import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CompactMacroSummary } from '@/components/nutrition/CompactMacroSummary';
import { RemainingCaloriesHero } from '@/components/nutrition/RemainingCaloriesHero';
import { PaywallHero } from '@/components/premium/PaywallHero';
import { Text } from '@/components/ui/Text';
import { getOrCreateNutritionTargets } from '@/db/repositories/nutritionRepository';
import { formatPlanDate } from '@/engines/workout';
import { usePremium } from '@/hooks/usePremium';
import { colors, radius, shadows, spacing } from '@/theme';
import type { NutritionTargets } from '@/types/nutrition';

const SAMPLE_TARGETS: NutritionTargets = {
  calories: 1850,
  proteinG: 118,
  carbsG: 195,
  fatG: 58,
  fiberG: 28,
  effectiveDate: formatPlanDate(new Date()),
  isManualOverride: false,
};

const SAMPLE_CONSUMED = {
  calories: 920,
  proteinG: 52,
  carbsG: 98,
  fatG: 28,
  fiberG: 14,
};

interface NutritionPreviewGateProps {
  onStartTrial?: () => void;
  onRestore?: () => void;
}

export function NutritionPreviewGate({ onStartTrial, onRestore }: NutritionPreviewGateProps) {
  const { beginFreeTrial, restore, openPaywall } = usePremium();
  const [targets, setTargets] = useState<NutritionTargets>(SAMPLE_TARGETS);

  useEffect(() => {
    void getOrCreateNutritionTargets(formatPlanDate(new Date()))
      .then((loaded) => {
        if (loaded) {
          setTargets(loaded);
        }
      })
      .catch(() => undefined);
  }, []);

  const remaining = targets.calories - SAMPLE_CONSUMED.calories;

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
        <Text variant="section">Nourishment tailored to you</Text>
        <Text variant="bodyMuted">
          Your macro targets are already calculated. Unlock BetterMe to log meals and see your day unfold.
        </Text>
      </View>

      <View style={styles.previewStack}>
        <Text variant="caption" style={styles.previewLabel}>
          Preview — your personalized targets
        </Text>
        <RemainingCaloriesHero
          remainingCalories={remaining}
          targetCalories={targets.calories}
          consumedCalories={SAMPLE_CONSUMED.calories}
        />
        <View style={[styles.macroCard, shadows.card]}>
          <Text variant="label">Today&apos;s macros</Text>
          <CompactMacroSummary consumed={SAMPLE_CONSUMED} targets={targets} />
        </View>

        <View style={[styles.aiCard, shadows.card]}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIcon}>
              <MaterialCommunityIcons name="camera-outline" size={22} color={colors.brandPrimary} />
            </View>
            <View style={styles.aiCopy}>
              <Text variant="h2">AI meal logging</Text>
              <Text variant="bodyMuted">
                Describe or photograph a meal — BetterMe estimates calories and macros in seconds.
              </Text>
            </View>
          </View>
          <View style={styles.aiSample}>
            <Text variant="bodyMuted" style={styles.aiSampleText}>
              &ldquo;Greek yogurt bowl with berries and honey&rdquo;
            </Text>
            <Text variant="label" style={styles.aiSampleResult}>
              ~420 kcal · 28g protein
            </Text>
          </View>
        </View>
      </View>

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
  previewStack: {
    gap: spacing.sm,
  },
  previewLabel: {
    textAlign: 'center',
    color: colors.brandSecondary,
  },
  macroCard: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  aiCard: {
    backgroundColor: colors.surfaceRose,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  aiHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceCanvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  aiCopy: {
    flex: 1,
    gap: 4,
  },
  aiSample: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  aiSampleText: {
    fontStyle: 'italic',
  },
  aiSampleResult: {
    color: colors.brandPrimary,
  },
});
