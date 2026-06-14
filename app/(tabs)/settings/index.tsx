import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { PremiumBadge } from '@/components/premium';
import { SettingsRow, SettingsSection } from '@/components/settings';
import { Screen } from '@/components/ui/Screen';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { spacing } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const units = usePreferencesStore((state) => state.preferences.units);

  return (
    <Screen title="Settings" subtitle="Your rhythm, your data, your control.">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PremiumBadge />

        <SettingsSection title="Profile">
          <SettingsRow label="Profile" value="Body & activity" onPress={() => router.push('/(tabs)/settings/profile')} />
          <SettingsRow label="Goals" value="Weight & pace" onPress={() => router.push('/(tabs)/settings/goals')} />
          <SettingsRow label="Preferences" value="Media & exercises" onPress={() => router.push('/(tabs)/settings/preferences')} />
          <SettingsRow label="Plan assumptions" onPress={() => router.push('/(tabs)/settings/plan-assumptions')} />
        </SettingsSection>

        <SettingsSection title="Nutrition">
          <SettingsRow label="Nutrition targets" onPress={() => router.push('/(tabs)/settings/nutrition')} />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow label="Reminders" onPress={() => router.push('/(tabs)/settings/notifications')} />
        </SettingsSection>

        <SettingsSection title="Units">
          <SettingsRow
            label="Measurement units"
            value={`${units.height === 'cm' ? 'cm' : 'in'} · ${units.weight}`}
            onPress={() => router.push('/(tabs)/settings/units')}
          />
        </SettingsSection>

        <SettingsSection title="Privacy">
          <SettingsRow label="Privacy center" onPress={() => router.push('/(tabs)/settings/privacy')} />
          <SettingsRow
            label="Visual physique assessment"
            value="Experimental · Premium"
            onPress={() => router.push('/(tabs)/progress/physique-assessment')}
          />
        </SettingsSection>

        <SettingsSection title="Data">
          <SettingsRow label="Data management" onPress={() => router.push('/(tabs)/settings/data')} />
          <SettingsRow
            label="Rebuild my plan"
            onPress={() => router.push('/(tabs)/settings/rebuild-plan')}
            destructive
          />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow label="About BetterMe" onPress={() => router.push('/(tabs)/settings/about')} />
          {__DEV__ ? (
            <SettingsRow label="Developer audit" onPress={() => router.push('/(tabs)/settings/dev-audit')} />
          ) : null}
        </SettingsSection>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
});
