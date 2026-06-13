import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { PaywallHero } from '@/components/premium/PaywallHero';
import { usePremium } from '@/hooks/usePremium';
import { spacing } from '@/theme';

interface PremiumGateProps {
  children?: ReactNode;
  onStartTrial?: () => void;
  onRestore?: () => void;
  compact?: boolean;
}

/** @deprecated Prefer PaywallHero or tab-specific preview gates. */
export function PremiumGate({
  children,
  onStartTrial,
  onRestore,
  compact = false,
}: PremiumGateProps) {
  const { beginFreeTrial, restore, openPaywall } = usePremium();

  const handleStartTrial = () => {
    if (onStartTrial) {
      onStartTrial();
      return;
    }
    openPaywall();
  };

  const handleRestore = async () => {
    if (onRestore) {
      onRestore();
      return;
    }
    try {
      await restore();
    } catch {
      openPaywall();
    }
  };

  return (
    <View style={styles.container}>
      {children}
      <PaywallHero
        compact={compact}
        onStartTrial={handleStartTrial}
        onRestore={() => void handleRestore()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
});
