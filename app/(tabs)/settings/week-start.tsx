import { Pressable, View } from 'react-native';

import { SettingsScreenShell } from '@/components/settings';
import { Text } from '@/components/ui/Text';
import { logSettingChange } from '@/db/repositories/settingsAuditRepository';
import { usePreferencesStore } from '@/stores/preferencesStore';
import type { WeekStartsOn } from '@/types/preferences';
import { WEEK_START_DAY_LABELS } from '@/types/preferences';
import { colors, createDynamicStyles, metrics, radius, spacing } from '@/theme';

const WEEK_START_OPTIONS: WeekStartsOn[] = [0, 1, 2, 3, 4, 5, 6];

export default function WeekStartSettingsScreen() {
  const weekStartsOn = usePreferencesStore((state) => state.preferences.weekStartsOn);
  const setWeekStartsOn = usePreferencesStore((state) => state.setWeekStartsOn);

  const selectDay = async (value: WeekStartsOn) => {
    if (value === weekStartsOn) {
      return;
    }
    await logSettingChange('weekStartsOn', weekStartsOn, value);
    setWeekStartsOn(value);
  };

  return (
    <SettingsScreenShell
      title="Week starts on"
      subtitle="Weekly coach summaries unlock on this day. Workout and rest days follow your training frequency from this week start."
    >
      <View style={styles.list}>
        {WEEK_START_OPTIONS.map((value) => {
          const selected = weekStartsOn === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => void selectDay(value)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text variant="body" style={selected ? styles.optionLabelSelected : undefined}>
                {WEEK_START_DAY_LABELS[value]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SettingsScreenShell>
  );
}

const styles = createDynamicStyles(() => ({
  list: {
    gap: spacing.xs,
  },
  option: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: metrics.touchTargetMin,
    justifyContent: 'center',
  },
  optionSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surfaceSelected,
  },
  optionLabelSelected: {
    color: colors.brandPrimary,
  },
}));
