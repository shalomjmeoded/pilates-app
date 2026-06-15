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
  const visibleBenefits = benefits.slice(0, compact ? 3 : 4);
  const ctaLabel =
    selectedPlan === 'yearly' ? 'Start 3-Day Free Trial' : 'Continue Monthly';

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={[styles.heroBand, compact && styles.heroBandCompact, !compact && shadows.hero]}>
        <View style={styles.heroAccent} />
        {!compact ? (
          <Text variant="label" style={styles.heroEyebrow}>
            Built from your answers
          </Text>
        ) : null}
        <Text
          variant={compact ? 'h1' : 'hero'}
          style={[styles.heroTitle, compact && styles.heroTitleCompact]}
          numberOfLines={compact ? 2 : undefined}
          adjustsFontSizeToFit={compact}
          minimumFontScale={0.84}
        >
          {title}
        </Text>
        {!compact ? (
          <Text variant="bodyMuted" style={styles.heroDescription}>
            {description}
          </Text>
        ) : null}
      </View>

      <View style={[styles.benefits, compact && styles.benefitsCompact]}>
        {visibleBenefits.map((benefit, index) => (
          <View key={benefit.title} style={[styles.benefitRow, compact && styles.benefitRowCompact]}>
            <View
              style={[
                styles.iconWrap,
                benefitAccentStyleList[index % benefitAccentStyleList.length],
                compact && styles.iconWrapCompact,
              ]}
            >
              <MaterialCommunityIcons
                name={benefit.icon}
                size={compact ? 17 : 22}
                color={benefitIconColors[index % benefitIconColors.length]}
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

      <View style={[styles.plans, compact && styles.plansCompact]}>
        <PlanOption
          title="Yearly"
          price="$29.99/year"
          detail="3 days free, then $29.99/year"
          badge="Best value"
          selected={selectedPlan === 'yearly'}
          onPress={() => setSelectedPlan('yearly')}
          compact={compact}
        />
        <PlanOption
          title="Monthly"
          price="$9.99/month"
          detail="Billed monthly"
          selected={selectedPlan === 'monthly'}
          onPress={() => setSelectedPlan('monthly')}
          compact={compact}
        />
      </View>

      <View style={[styles.actions, compact && styles.actionsCompact]}>
        <Button
          label={ctaLabel}
          onPress={() => onStartTrial(selectedPlan)}
          style={styles.ctaButton}
        />
        <Text variant="caption" style={styles.trialNote}>
          {selectedPlan === 'yearly'
            ? '3 days free, then $29.99/year. Cancel anytime.'
            : '$9.99/month. Cancel anytime.'}
        </Text>
        <View style={styles.linkActions}>
          <Pressable accessibilityRole="button" onPress={onRestore} hitSlop={10}>
            <Text variant="caption" style={styles.linkActionText}>
              Restore purchase
            </Text>
          </Pressable>
          {onContinueWithTrial ? (
            <Pressable accessibilityRole="button" onPress={onContinueWithTrial} hitSlop={10}>
              <Text variant="caption" style={styles.linkActionText}>
                Dev trial
              </Text>
            </Pressable>
          ) : null}
        </View>
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
  compact?: boolean;
}

function PlanOption({ title, price, detail, badge, selected, onPress, compact = false }: PlanOptionProps) {
  const yearly = title === 'Yearly';

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.planOption,
        compact && styles.planOptionCompact,
        selected && styles.planOptionSelected,
        selected && yearly && styles.yearlySelected,
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
          size={compact ? 22 : 24}
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
  containerCompact: {
    gap: spacing.xs,
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
  heroBandCompact: {
    borderRadius: radius.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    gap: 0,
  },
  heroAccent: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DDEBFF',
    opacity: 0.85,
  },
  heroEyebrow: {
    color: colors.brandSecondary,
  },
  heroTitle: {
    color: colors.textStrong,
    maxWidth: 340,
  },
  heroTitleCompact: {
    fontSize: 25,
    lineHeight: 30,
    maxWidth: 360,
  },
  heroDescription: {
    lineHeight: 24,
    maxWidth: 360,
  },
  benefits: {
    gap: spacing.sm,
  },
  benefitsCompact: {
    gap: 6,
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
  benefitRowCompact: {
    minHeight: 38,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
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
  iconWrapCompact: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
  actionsCompact: {
    gap: 6,
  },
  plans: {
    gap: spacing.xs,
  },
  plansCompact: {
    gap: 6,
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
  planOptionCompact: {
    minHeight: 62,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  planOptionSelected: {
    borderColor: '#24A35A',
    backgroundColor: '#ECF9F1',
  },
  yearlySelected: {
    borderColor: '#E1A700',
    backgroundColor: '#FFF7D7',
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
    backgroundColor: '#F7C948',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#3B2A00',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  planRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  planPrice: {
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  ctaButton: {
    backgroundColor: '#24A35A',
    borderColor: '#167A40',
    shadowColor: '#167A40',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  trialNote: {
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
    lineHeight: 18,
  },
  linkActions: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  linkActionText: {
    color: '#2F6FDB',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});

const benefitIconColors = ['#2F6FDB', '#24A35A', '#E1A700'];

const benefitAccentStyleMap = StyleSheet.create({
  blue: {
    backgroundColor: '#EAF2FF',
    borderColor: '#BBD4FF',
  },
  green: {
    backgroundColor: '#ECF9F1',
    borderColor: '#BFE8CD',
  },
  yellow: {
    backgroundColor: '#FFF7D7',
    borderColor: '#F4DC7D',
  },
});

const benefitAccentStyleList = [
  benefitAccentStyleMap.blue,
  benefitAccentStyleMap.green,
  benefitAccentStyleMap.yellow,
];
