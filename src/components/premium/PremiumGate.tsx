import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { PAYWALL_BENEFITS, PAYWALL_SUBTITLE, PAYWALL_TITLE } from '@/constants/premiumBenefits';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { usePremium } from '@/hooks/usePremium';
import { colors, spacing } from '@/theme';

interface PremiumGateProps {
  title?: string;
  description?: string;
  bullets?: string[];
  children?: ReactNode;
  onStartTrial?: () => void;
  onRestore?: () => void;
}

export function PremiumGate({
  title = PAYWALL_TITLE,
  description = PAYWALL_SUBTITLE,
  bullets = [...PAYWALL_BENEFITS],
  children,
  onStartTrial,
  onRestore,
}: PremiumGateProps) {
  const { restore, openPaywall } = usePremium();

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
      <Card style={styles.card}>
        <Text variant="label">Premium required</Text>
        <Text variant="h1">{title}</Text>
        <Text variant="bodyMuted">{description}</Text>
        <View style={styles.bullets}>
          {bullets.map((item) => (
            <Text key={item} variant="body">
              ✓ {item}
            </Text>
          ))}
        </View>
        <Button label="Start Free Trial" onPress={handleStartTrial} />
        <Button label="Restore Purchase" variant="secondary" onPress={() => void handleRestore()} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
  },
  bullets: {
    gap: 4,
  },
});
