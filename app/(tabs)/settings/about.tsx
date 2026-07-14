import { useState } from 'react';

import { SettingsScreenShell } from '@/components/settings';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { usePremium } from '@/hooks/usePremium';
import { clearDevPremiumBypass } from '@/services/monetization/devPremiumBypass';
import { usePremiumStore } from '@/stores/premiumStore';
import { colors, spacing, createDynamicStyles } from '@/theme';

export default function AboutSettingsScreen() {
  const { hasAccess, unlockDevPremium } = usePremium();
  const setStatus = usePremiumStore((state) => state.setStatus);
  const [message, setMessage] = useState<string | null>(null);

  const onUnlock = async () => {
    try {
      await unlockDevPremium();
      setMessage('Premium unlocked for this device (dev bypass).');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not unlock.');
    }
  };

  const onClear = async () => {
    try {
      const status = await clearDevPremiumBypass();
      setStatus(status);
      setMessage('Dev premium cleared.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not clear.');
    }
  };

  return (
    <SettingsScreenShell title="About" subtitle="BetterMe — movement, nutrition, reflection.">
      <Card style={styles.card}>
        <Text variant="h2">BetterMe</Text>
        <Text variant="bodyMuted">Version 1.0.0</Text>
        <Text variant="bodyMuted" style={styles.copy}>
          A local-first wellness app for Pilates-inspired movement, thoughtful nutrition, and calm
          progress tracking.
        </Text>
      </Card>
      <Card style={styles.card}>
        <Text variant="bodyMuted" style={styles.copy}>
          Built offline-first. No account required. Your data stays on your device.
        </Text>
      </Card>

      {__DEV__ ? (
        <Card style={styles.card}>
          <Text variant="label">Developer</Text>
          <Text variant="bodyMuted" style={styles.copy}>
            {hasAccess
              ? 'Premium is active on this device.'
              : 'Bypass RevenueCat and unlock premium locally.'}
          </Text>
          <Button
            label={hasAccess ? 'Dev: refresh premium bypass' : 'Dev: unlock premium'}
            onPress={() => void onUnlock()}
          />
          {hasAccess ? (
            <Button label="Dev: clear premium" variant="secondary" onPress={() => void onClear()} />
          ) : null}
          {message ? (
            <Text variant="caption" style={styles.devMessage}>
              {message}
            </Text>
          ) : null}
        </Card>
      ) : null}
    </SettingsScreenShell>
  );
}

const styles = createDynamicStyles(() => ({
  card: {
    gap: spacing.xs,
  },
  copy: {
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  devMessage: {
    color: colors.brandPrimary,
  },
}));
