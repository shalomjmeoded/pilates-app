import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PremiumBadge } from '@/components/premium';
import { SettingsRow, SettingsSection } from '@/components/settings';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { colors, radius, spacing } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const units = usePreferencesStore((state) => state.preferences.units);

  return (
    <Screen title="Settings" subtitle="Your rhythm, your data, your control.">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PremiumBadge />

        <View style={styles.overview}>
          <TextRow label="Units" value={`${units.height === 'cm' ? 'Metric' : 'Imperial'} · ${units.weight}`} />
          <TextRow label="Plan" value="Ready" />
          <TextRow label="Privacy" value="Local-first" />
        </View>

        <SettingsSection title="Profile" accentColor={colors.brandSecondary}>
          <SettingsRow accentColor={colors.brandSecondary} label="Profile" value="Body & activity" onPress={() => router.push('/(tabs)/settings/profile')} />
          <SettingsRow accentColor={colors.brandSecondary} label="Goals" value="Weight & pace" onPress={() => router.push('/(tabs)/settings/goals')} />
          <SettingsRow accentColor={colors.brandSecondary} label="Preferences" value="Exercise styles" onPress={() => router.push('/(tabs)/settings/preferences')} />
          <SettingsRow label="Plan assumptions" onPress={() => router.push('/(tabs)/settings/plan-assumptions')} />
        </SettingsSection>

        <SettingsSection title="Nutrition" accentColor={colors.accentWarm}>
          <SettingsRow accentColor={colors.accentWarm} label="Nutrition targets" onPress={() => router.push('/(tabs)/settings/nutrition')} />
        </SettingsSection>

        <SettingsSection title="Notifications" accentColor="#2F6FDB">
          <SettingsRow accentColor="#2F6FDB" label="Reminders" onPress={() => router.push('/(tabs)/settings/notifications')} />
        </SettingsSection>

        <SettingsSection title="Units" accentColor={colors.accentCool}>
          <SettingsRow
            accentColor={colors.accentCool}
            label="Measurement units"
            value={`${units.height === 'cm' ? 'cm' : 'in'} · ${units.weight}`}
            onPress={() => router.push('/(tabs)/settings/units')}
          />
        </SettingsSection>

        <SettingsSection title="Privacy" accentColor="#9B7BB8">
          <SettingsRow accentColor="#9B7BB8" label="Privacy center" onPress={() => router.push('/(tabs)/settings/privacy')} />
          <SettingsRow
            label="Visual physique assessment"
            value="Experimental · Premium"
            onPress={() => router.push('/(tabs)/progress/physique-assessment')}
          />
        </SettingsSection>

        <SettingsSection title="Data" accentColor={colors.destructive}>
          <SettingsRow label="Data management" onPress={() => router.push('/(tabs)/settings/data')} />
          <SettingsRow
            label="Rebuild my plan"
            onPress={() => router.push('/(tabs)/settings/rebuild-plan')}
            destructive
          />
        </SettingsSection>

        <SettingsSection title="About" accentColor={colors.textMuted}>
          <SettingsRow label="About BetterMe" onPress={() => router.push('/(tabs)/settings/about')} />
        </SettingsSection>
      </ScrollView>
    </Screen>
  );
}

function TextRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.overviewChip}>
      <Text variant="caption" style={styles.overviewLabel}>
        {label}
      </Text>
      <Text variant="label" style={styles.overviewValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  overview: {
    flexDirection: 'row',
    gap: spacing.xs,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
    padding: spacing.xs,
  },
  overviewChip: {
    flex: 1,
    minHeight: 54,
    justifyContent: 'center',
    gap: 3,
    borderRadius: radius.square,
    backgroundColor: colors.surfaceRose,
    paddingHorizontal: spacing.xs,
  },
  overviewLabel: {
    color: colors.textMuted,
  },
  overviewValue: {
    color: colors.textStrong,
  },
});
