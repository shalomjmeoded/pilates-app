import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { usePremium } from '@/hooks/usePremium';
import { colors, radius, spacing } from '@/theme';

export function PremiumBadge() {
  const { status, hasAccess } = usePremium();

  const label = !hasAccess
    ? 'Subscription required'
    : status.subscriptionStatus === 'trial'
      ? 'Trial active'
      : 'Premium active';

  return (
    <View
      style={[
        styles.badge,
        !hasAccess ? styles.inactive : status.subscriptionStatus === 'trial' ? styles.trial : styles.active,
      ]}
    >
      <Text variant="label" style={styles.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
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
  text: {
    color: colors.textDark,
  },
});
