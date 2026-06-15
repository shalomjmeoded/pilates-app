import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import {
  getBirthYearBounds,
  isBirthYearWithinSupportedAge,
} from '@/onboarding/helpers';
import { colors, radius, spacing } from '@/theme';
import { selectionHaptic } from '@/utils/haptics';

const { minYear: MIN_YEAR, maxYear: MAX_YEAR } = getBirthYearBounds();
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'Del'] as const;

interface CompactYearPickerProps {
  value: number | null;
  onChange: (year: number | null) => void;
}

function getStatusText(input: string): string {
  if (input.length === 0) {
    return `Enter a year from ${MIN_YEAR} to ${MAX_YEAR}.`;
  }

  if (input.length < 4) {
    return 'Enter 4 digits.';
  }

  const year = Number(input);
  return isBirthYearWithinSupportedAge(year)
    ? 'Year selected.'
    : `Choose a year from ${MIN_YEAR} to ${MAX_YEAR}.`;
}

export function CompactYearPicker({ value, onChange }: CompactYearPickerProps) {
  const [input, setInput] = useState(value ? String(value) : '');

  const commitInput = (nextInput: string) => {
    setInput(nextInput);

    if (nextInput.length !== 4) {
      onChange(null);
      return;
    }

    const year = Number(nextInput);
    onChange(isBirthYearWithinSupportedAge(year) ? year : null);
  };

  const pressKey = (key: (typeof KEYS)[number]) => {
    selectionHaptic();

    if (key === 'Clear') {
      commitInput('');
      return;
    }

    if (key === 'Del') {
      commitInput(input.slice(0, -1));
      return;
    }

    const nextInput = input.length >= 4 ? key : `${input}${key}`;
    commitInput(nextInput);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.display}>
        <Text
          variant="display"
          style={[styles.selectedYear, !input && styles.placeholderYear]}
          accessibilityLabel={input ? `Entered birth year ${input}` : 'No birth year entered'}
        >
          {input || 'YYYY'}
        </Text>
        <Text variant="caption" style={styles.status}>
          {getStatusText(input)}
        </Text>
      </View>

      <View style={styles.keypad} accessibilityLabel="Birth year keypad">
        {KEYS.map((key) => {
          const isAction = key === 'Clear' || key === 'Del';
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={
                key === 'Del' ? 'Delete last digit' : key === 'Clear' ? 'Clear birth year' : `Enter ${key}`
              }
              onPress={() => pressKey(key)}
              style={({ pressed }) => [
                styles.key,
                isAction && styles.actionKey,
                pressed && styles.keyPressed,
              ]}
            >
              <Text variant={isAction ? 'label' : 'h2'} style={isAction ? styles.actionKeyText : styles.keyText}>
                {key}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  display: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 104,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 6,
  },
  selectedYear: {
    color: colors.brandPrimary,
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: 0,
  },
  placeholderYear: {
    color: colors.borderStrong,
  },
  status: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  key: {
    width: '30.9%',
    minHeight: 64,
    flexGrow: 1,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionKey: {
    backgroundColor: colors.surfaceRose,
  },
  keyPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  keyText: {
    color: colors.brandPrimary,
  },
  actionKeyText: {
    color: colors.brandPrimary,
  },
});
