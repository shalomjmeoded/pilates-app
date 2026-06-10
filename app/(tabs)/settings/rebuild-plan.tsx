import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { SettingsScreenShell } from '@/components/settings';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { getProfile } from '@/db/repositories/profileRepository';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { spacing } from '@/theme';

export default function RebuildPlanScreen() {
  const router = useRouter();
  const setOnboardingCompleted = usePreferencesStore((state) => state.setOnboardingCompleted);
  const loadDraftFromProfile = useOnboardingStore((state) => state.loadDraftFromProfile);
  const setRebuildMode = useOnboardingStore((state) => state.setRebuildMode);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRebuild = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const profile = await getProfile();
      if (!profile) {
        setError('Profile not found.');
        return;
      }

      loadDraftFromProfile(profile);
      setRebuildMode(true);
      setOnboardingCompleted(false);
      router.replace('/onboarding/step-01-gender');
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Could not start rebuild.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <SettingsScreenShell title="Rebuild my plan" subtitle="Start fresh without losing your history.">
      <Card style={styles.card}>
        <Text variant="h2">What will be kept</Text>
        <Text variant="bodyMuted">Weight logs, meal history, workout history, and milestones.</Text>
      </Card>
      <Card style={styles.card}>
        <Text variant="h2">What will be replaced</Text>
        <Text variant="bodyMuted">Profile preferences, nutrition targets, and plan settings.</Text>
      </Card>
      <Text variant="bodyMuted" style={styles.warning}>
        You will walk through onboarding again to rebuild your plan.
      </Text>
      {error ? <Text variant="body" style={styles.error}>{error}</Text> : null}
      <Button label={isStarting ? 'Starting...' : 'Rebuild my plan'} onPress={() => void handleRebuild()} disabled={isStarting} />
      <Button label="Cancel" variant="secondary" onPress={() => router.back()} />
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  warning: {
    lineHeight: 22,
  },
  error: {
    color: '#C97A87',
  },
});
