import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import {
  PAYWALL_OUTCOME_BENEFITS,
  PAYWALL_SUBTITLE,
  PAYWALL_TITLE,
  type PaywallOutcomeBenefit,
} from '@/constants/premiumBenefits';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, radius, shadows, spacing } from '@/theme';

interface PaywallHeroProps {
  title?: string;
  description?: string;
  benefits?: PaywallOutcomeBenefit[];
  onStartTrial: () => void;
  onRestore: () => void;
  compact?: boolean;
}

export function PaywallHero({
  title = PAYWALL_TITLE,
  description = PAYWALL_SUBTITLE,
  benefits = PAYWALL_OUTCOME_BENEFITS,
  onStartTrial,
  onRestore,
  compact = false,
}: PaywallHeroProps) {
  const visibleBenefits = compact ? benefits.slice(0, 4) : benefits;

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

      <View style={styles.actions}>
        <Button label="Start Free Trial" onPress={onStartTrial} />
        <Button label="Restore Purchase" variant="secondary" onPress={onRestore} />
        <Text variant="caption" style={styles.trialNote}>
          Free trial, then subscription. Cancel anytime.
        </Text>
      </View>
    </View>
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
  trialNote: {
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
    lineHeight: 18,
  },
});
