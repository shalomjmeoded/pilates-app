import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  PAYWALL_OUTCOME_BENEFITS,
  PAYWALL_SUBTITLE,
  PAYWALL_TITLE,
  type PaywallOutcomeBenefit,
} from '@/constants/premiumBenefits';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radius, shadows, spacing } from '@/theme';
import type { PremiumPlanId } from '@/types/premium';

interface PaywallHeroProps {
  title?: string;
  description?: string;
  benefits?: PaywallOutcomeBenefit[];
  onStartTrial: (plan: PremiumPlanId) => void;
  onContinueWithTrial?: () => void;
  onRestore: () => void;
  compact?: boolean;
}

export function PaywallHero({
  title = PAYWALL_TITLE,
  description = PAYWALL_SUBTITLE,
  benefits = PAYWALL_OUTCOME_BENEFITS,
  onStartTrial,
  onContinueWithTrial,
  onRestore,
  compact = false,
}: PaywallHeroProps) {
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlanId>('yearly');
  const visibleBenefits = compact ? benefits.slice(0, 4) : benefits;
  const ctaLabel =
    selectedPlan === 'yearly' ? 'Start 3-Day Free Trial' : 'Continue Monthly';

  return (
    <View style={styles.container}>
      <View style={[styles.heroBand, shadows.hero]}>
        <View style={styles.heroAccent} />
        <Text variant="label" style={styles.heroEyebrow}>
          Built from your answers
        </Text>
        <Text variant={compact ? 'section' : 'hero'} style={styles.heroTitle}>
          {title}
        </Text>
        {!compact ? (
          <Text variant="bodyMuted" style={styles.heroDescription}>
            {description}
          </Text>
        ) : null}
      </View>

      <View style={styles.benefits}>
        {visibleBenefits.map((benefit) => (
          <View key={benefit.title} style={styles.benefitRow}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons
                name={benefit.icon}
                size={22}
                color={colors.brandPrimary}
              />
            </View>
            <View style={styles.benefitCopy}>
              <Text variant="body" style={styles.benefitTitle}>
                {benefit.title}
              </Text>
              {!compact ? (
                <Text variant="bodyMuted" style={styles.benefitDescription}>
                  {benefit.description}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.plans}>
        <PlanOption
          title="Yearly"
          price="$29.99/year"
          detail="3 days free, then $29.99/year"
          badge="Best value"
          selected={selectedPlan === 'yearly'}
          onPress={() => setSelectedPlan('yearly')}
        />
        <PlanOption
          title="Monthly"
          price="$9.99/month"
          detail="Billed monthly"
          selected={selectedPlan === 'monthly'}
          onPress={() => setSelectedPlan('monthly')}
        />
      </View>

      <View style={styles.actions}>
        <Button label={ctaLabel} onPress={() => onStartTrial(selectedPlan)} />
        {onContinueWithTrial ? (
          <Button label="Continue with trial" variant="secondary" onPress={onContinueWithTrial} />
        ) : null}
        <Button label="Restore Purchase" variant="secondary" onPress={onRestore} />
        <Text variant="caption" style={styles.trialNote}>
          Free trial, then subscription. Cancel anytime.
        </Text>
      </View>
    </View>
  );
}

interface PlanOptionProps {
  title: string;
  price: string;
  detail: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}

function PlanOption({ title, price, detail, badge, selected, onPress }: PlanOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.planOption,
        selected && styles.planOptionSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.planCopy}>
        <View style={styles.planTitleRow}>
          <Text variant="body" style={styles.planTitle}>
            {title}
          </Text>
          {badge ? (
            <View style={styles.badge}>
              <Text variant="caption" style={styles.badgeText}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        <Text variant="bodyMuted">{detail}</Text>
      </View>
      <View style={styles.planRight}>
        <Text variant="body" style={styles.planPrice}>
          {price}
        </Text>
        <MaterialCommunityIcons
          name={selected ? 'radiobox-marked' : 'radiobox-blank'}
          size={24}
          color={selected ? colors.brandPrimary : colors.textMuted}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  heroBand: {
    backgroundColor: colors.surfaceHero,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.sm,
    gap: spacing.xs,
    overflow: 'hidden',
  },
  heroAccent: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceRose,
    opacity: 0.55,
  },
  heroEyebrow: {
    color: colors.brandSecondary,
  },
  heroTitle: {
    color: colors.textStrong,
    maxWidth: 340,
  },
  heroDescription: {
    lineHeight: 24,
    maxWidth: 360,
  },
  benefits: {
    gap: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceRose,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  benefitCopy: {
    flex: 1,
    gap: 2,
  },
  benefitTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  benefitDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: spacing.xs,
  },
  plans: {
    gap: spacing.xs,
  },
  planOption: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
  },
  planOptionSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surfaceRose,
  },
  pressed: {
    opacity: 0.86,
  },
  planCopy: {
    flex: 1,
    gap: 4,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  planTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  badge: {
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.warmWhite,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  planRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  planPrice: {
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  trialNote: {
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
    lineHeight: 18,
  },
});
