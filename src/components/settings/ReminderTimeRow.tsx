import { StyleSheet, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { SettingsToggleRow } from '@/components/settings/SettingsToggleRow';
import { Text } from '@/components/ui/Text';
import type { Reminder } from '@/types/settings';
import { REMINDER_LABELS } from '@/types/settings';
import { colors, radius, spacing } from '@/theme';

interface ReminderTimeRowProps {
  reminder: Reminder;
  onToggle: () => void;
  onTimeChange: (hour: number, minute: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = [0, 15, 30, 45];

export function ReminderTimeRow({ reminder, onToggle, onTimeChange }: ReminderTimeRowProps) {
  return (
    <View style={styles.wrap}>
      <SettingsToggleRow
        label={REMINDER_LABELS[reminder.type]}
        enabled={reminder.enabled}
        onToggle={onToggle}
      />
      {reminder.enabled ? (
        <View style={styles.timeRow}>
          <Text variant="label">Time</Text>
          <View style={styles.pickers}>
            <Picker
              selectedValue={reminder.hour}
              onValueChange={(hour) => onTimeChange(Number(hour), reminder.minute)}
              style={styles.picker}
            >
              {HOURS.map((hour) => (
                <Picker.Item key={hour} label={formatHour(hour)} value={hour} />
              ))}
            </Picker>
            <Picker
              selectedValue={reminder.minute}
              onValueChange={(minute) => onTimeChange(reminder.hour, Number(minute))}
              style={styles.picker}
            >
              {MINUTES.map((minute) => (
                <Picker.Item key={minute} label={formatMinute(minute)} value={minute} />
              ))}
            </Picker>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized} ${suffix}`;
}

function formatMinute(minute: number): string {
  return minute.toString().padStart(2, '0');
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  timeRow: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  pickers: {
    flexDirection: 'row',
  },
  picker: {
    flex: 1,
  },
});
