import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { usePremium } from '@/hooks/usePremium';
import { colors, radius, spacing } from '@/theme';

export function PremiumBadge() {
  const { status, hasAccess } = usePremium();

  const isTrial = hasAccess && status.subscriptionStatus === 'trial';
  const isActive = hasAccess && !isTrial;
  const label = !hasAccess
    ? 'Subscription required'
    : isTrial
      ? 'Trial active'
      : 'Premium active';

  return (
    <View
      style={[
        styles.badge,
        !hasAccess ? styles.inactive : isTrial ? styles.trial : styles.active,
      ]}
    >
      <View
        style={[
          styles.dot,
          !hasAccess ? styles.dotInactive : isTrial ? styles.dotTrial : styles.dotActive,
        ]}
      />
      <Text
        variant="label"
        numberOfLines={1}
        style={[
          styles.text,
          isActive && styles.activeText,
          isTrial && styles.trialText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  inactive: {
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  trial: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
  },
  active: {
    backgroundColor: colors.brandPrimary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotInactive: {
    backgroundColor: colors.destructive,
  },
  dotTrial: {
    backgroundColor: colors.brandPrimary,
  },
  dotActive: {
    backgroundColor: colors.surfaceCanvas,
  },
  text: {
    color: colors.textDark,
  },
  trialText: {
    color: colors.brandPrimary,
  },
  activeText: {
    color: colors.surfaceCanvas,
  },
});
