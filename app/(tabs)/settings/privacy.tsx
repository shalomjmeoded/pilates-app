import { StyleSheet } from 'react-native';

import { SettingsScreenShell } from '@/components/settings';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { colors, spacing } from '@/theme';

export default function PrivacySettingsScreen() {
  const storageBackend = usePreferencesStore((state) => state.preferences.storageBackend);

  return (
    <SettingsScreenShell title="Privacy" subtitle="Your wellness data belongs to you.">
      <Card style={styles.card}>
        <Text variant="h2">What stays on device</Text>
        <Text variant="bodyMuted" style={styles.copy}>
          Profile, workouts, meals, weight logs, milestones, and nutrition history are stored locally in SQLite on your phone.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text variant="h2">What leaves device</Text>
        <Text variant="bodyMuted" style={styles.copy}>
          Only the specific AI request you start — meal text, a meal photo, physique photos, workout context, or coach prompts.
          Requests are sent to Google’s Gemini API with only the data needed for that feature.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text variant="h2">AI explanation</Text>
        <Text variant="bodyMuted" style={styles.copy}>
          AI is optional and premium-gated. You review every AI meal estimate before saving. Tune stores local audit
          rows in ai_outputs (feature, request summary, validation result) and quota counters in ai_usage — never full
          meal photos. AI is never used for ads.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text variant="h2">No ads. No analytics.</Text>
        <Text variant="bodyMuted" style={styles.copy}>
          Tune does not include ad SDKs or third-party analytics trackers.
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text variant="h2">Storage backend</Text>
        <Text variant="body">SQLite: Active</Text>
        <Text variant="body">
          MMKV: {storageBackend === 'mmkv' ? 'Active' : 'Fallback active (session only)'}
        </Text>
        {storageBackend === 'memory' ? (
          <Text variant="bodyMuted" style={styles.copy}>
            Onboarding status is restored from SQLite when MMKV is unavailable.
          </Text>
        ) : null}
      </Card>
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  copy: {
    lineHeight: 22,
  },
});
