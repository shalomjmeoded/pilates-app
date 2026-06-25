import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

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

const PRIVACY_POLICY_URL = 'https://clearday-seven.vercel.app/betterme';
const TERMS_OF_USE_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export interface PaywallOutcomeSummary {
  title: string;
  highlightedValue?: string;
  suffix?: string;
  caption: string;
}

interface PaywallHeroProps {
  title?: string;
  description?: string;
  benefits?: PaywallOutcomeBenefit[];
  outcome?: PaywallOutcomeSummary;
  onStartTrial: (plan: PremiumPlanId) => void;
  onRestore: () => void;
  compact?: boolean;
}

export function PaywallHero({
  title = PAYWALL_TITLE,
  description = PAYWALL_SUBTITLE,
  benefits = PAYWALL_OUTCOME_BENEFITS,
  outcome,
  onStartTrial,
  onRestore,
  compact = false,
}: PaywallHeroProps) {
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlanId>('yearly');
  const visibleBenefits = benefits.slice(0, compact ? (outcome ? 2 : 3) : 4);
  const ctaLabel = selectedPlan === 'yearly' ? 'Start 3-Day Free Trial' : 'Continue Monthly';
  const disclosure =
    selectedPlan === 'yearly'
      ? '3 days free, then $29.99/year. Auto-renews unless canceled.'
      : '$9.99/month. Auto-renews unless canceled.';

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {outcome ? (
        <OutcomeBanner outcome={outcome} />
      ) : (
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
      )}

      <TrustChipRow selectedPlan={selectedPlan} />

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
          badge="3-day free trial"
          selected={selectedPlan === 'yearly'}
          onPress={() => setSelectedPlan('yearly')}
          compact={compact}
        />
        <PlanOption
          title="Monthly"
          price="$9.99/month"
          detail="$9.99/month"
          selected={selectedPlan === 'monthly'}
          onPress={() => setSelectedPlan('monthly')}
          compact={compact}
        />
      </View>

      <OfferNotice selectedPlan={selectedPlan} />

      <View style={[styles.actions, compact && styles.actionsCompact]}>
        <Button
          label={ctaLabel}
          onPress={() => onStartTrial(selectedPlan)}
          style={styles.ctaButton}
        />
        <Text variant="caption" style={styles.trialNote}>
          {disclosure}
        </Text>
        <Text variant="caption" style={styles.cancelNote}>
          Manage or cancel in your App Store account settings.
        </Text>
        <View style={styles.linkActions}>
          <Pressable accessibilityRole="button" onPress={onRestore} hitSlop={10}>
            <Text variant="caption" style={styles.linkActionText}>
              Restore purchase
            </Text>
          </Pressable>
        </View>
        <View style={styles.legalLinks}>
          <Pressable
            accessibilityRole="link"
            onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
            hitSlop={10}
          >
            <Text variant="caption" style={styles.legalLinkText}>
              Privacy Policy
            </Text>
          </Pressable>
          <Text variant="caption" style={styles.legalSeparator}>
            •
          </Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => void Linking.openURL(TERMS_OF_USE_URL)}
            hitSlop={10}
          >
            <Text variant="caption" style={styles.legalLinkText}>
              Terms of Use
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function OutcomeBanner({ outcome }: { outcome: PaywallOutcomeSummary }) {
  return (
    <View style={styles.outcomeBanner}>
      <View style={styles.outcomeIcon}>
        <MaterialCommunityIcons name="bullseye-arrow" size={20} color="#D85F7A" />
      </View>
      <View style={styles.outcomeCopy}>
        <Text variant="h1" style={styles.outcomeTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>
          {outcome.title}
        </Text>
        {outcome.highlightedValue ? (
          <View style={styles.outcomeLine}>
            <Text variant="h1" style={styles.outcomeHighlight}>
              {outcome.highlightedValue}
            </Text>
            {outcome.suffix ? (
              <Text variant="h1" style={styles.outcomeSuffix} numberOfLines={1}>
                {outcome.suffix}
              </Text>
            ) : null}
          </View>
        ) : null}
        <Text variant="bodyMuted" style={styles.outcomeCaption} numberOfLines={1}>
          {outcome.caption}
        </Text>
      </View>
    </View>
  );
}

function OfferNotice({ selectedPlan }: { selectedPlan: PremiumPlanId }) {
  const yearlySelected = selectedPlan === 'yearly';

  return (
    <View
      accessibilityRole="text"
      style={[
        styles.offerNotice,
        yearlySelected ? styles.offerNoticeTrial : styles.offerNoticeMonthly,
      ]}
    >
      <View style={[styles.offerIcon, yearlySelected ? styles.offerIconTrial : styles.offerIconMonthly]}>
        <MaterialCommunityIcons
          name={yearlySelected ? 'check-circle-outline' : 'calendar-today'}
          size={17}
          color={yearlySelected ? '#167A40' : '#5D4A12'}
        />
      </View>
      <Text variant="body" style={styles.offerNoticeText}>
        {yearlySelected ? '3-day free trial included' : 'Monthly plan starts today'}
      </Text>
    </View>
  );
}

function TrustChipRow({ selectedPlan }: { selectedPlan: PremiumPlanId }) {
  const chips =
    selectedPlan === 'yearly'
      ? ['No payment today', 'Cancel anytime']
      : ['Cancel anytime'];

  return (
    <View style={styles.trustChips}>
      {chips.map((chip, index) => (
        <View key={chip} style={[styles.trustChip, trustChipStyleList[index % trustChipStyleList.length]]}>
          <MaterialCommunityIcons name="check-circle-outline" size={14} color={trustChipIconColors[index % trustChipIconColors.length]} />
          <Text variant="caption" style={styles.trustChipText}>
            {chip}
          </Text>
        </View>
      ))}
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
    minHeight: 34,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
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
    width: 24,
    height: 24,
    borderRadius: 12,
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
  outcomeBanner: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    overflow: 'hidden',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: '#E8A5B4',
    backgroundColor: '#FFF0F4',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  outcomeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE0E8',
    borderWidth: 1,
    borderColor: '#E8A5B4',
  },
  outcomeCopy: {
    flex: 1,
    gap: 3,
  },
  outcomeTitle: {
    color: colors.textStrong,
    fontSize: 22,
    lineHeight: 26,
  },
  outcomeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },
  outcomeHighlight: {
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#D85F7A',
    color: colors.warmWhite,
    fontSize: 26,
    lineHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 1,
  },
  outcomeSuffix: {
    color: colors.textStrong,
    fontSize: 22,
    lineHeight: 28,
  },
  outcomeCaption: {
    fontSize: 13,
    lineHeight: 16,
  },
  trustChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  trustChip: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  trustChipText: {
    color: colors.textStrong,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  actions: {
    gap: spacing.xs,
  },
  actionsCompact: {
    gap: 4,
  },
  plans: {
    gap: spacing.xs,
  },
  plansCompact: {
    gap: 5,
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
    minHeight: 58,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  planOptionSelected: {
    borderColor: '#24A35A',
    backgroundColor: '#ECF9F1',
  },
  yearlySelected: {
    borderColor: '#E1A700',
    backgroundColor: '#FFF7D7',
  },
  offerNotice: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  offerNoticeTrial: {
    borderColor: '#BFE8CD',
    backgroundColor: '#ECF9F1',
  },
  offerNoticeMonthly: {
    borderColor: '#F4DC7D',
    backgroundColor: '#FFF7D7',
  },
  offerIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  offerIconTrial: {
    backgroundColor: '#DDF5E6',
    borderColor: '#BFE8CD',
  },
  offerIconMonthly: {
    backgroundColor: '#FFF1B6',
    borderColor: '#F4DC7D',
  },
  offerNoticeText: {
    flex: 1,
    color: colors.textStrong,
    fontFamily: 'PlusJakartaSans_700Bold',
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
  cancelNote: {
    textAlign: 'center',
    color: colors.textMuted,
    lineHeight: 16,
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
  legalLinks: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  legalLinkText: {
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    color: colors.textMuted,
  },
});

const benefitIconColors = ['#2F6FDB', '#24A35A', '#E1A700'];
const trustChipIconColors = ['#24A35A', '#2F6FDB', '#E1A700'];

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

const trustChipStyleMap = StyleSheet.create({
  green: {
    backgroundColor: '#ECF9F1',
    borderColor: '#BFE8CD',
  },
  blue: {
    backgroundColor: '#EAF2FF',
    borderColor: '#BBD4FF',
  },
  yellow: {
    backgroundColor: '#FFF7D7',
    borderColor: '#F4DC7D',
  },
});

const trustChipStyleList = [
  trustChipStyleMap.green,
  trustChipStyleMap.blue,
  trustChipStyleMap.yellow,
];
