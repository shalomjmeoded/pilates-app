import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { PACE_OPTIONS } from '@/onboarding/constants';
import { colors, radius, spacing } from '@/theme';
import type { Pace } from '@/types/profile';
import { formatPacePercent, paceToPercent } from '@/utils/pace';

interface PaceIntensityPickerProps {
  value: Pace | null;
  onChange: (pace: Pace) => void;
}

const PACE_VALUES = PACE_OPTIONS.map((option) => option.value);

function getPaceIndex(pace: Pace | null): number {
  if (pace === null) {
    return 1;
  }
  const index = PACE_VALUES.indexOf(pace);
  return index >= 0 ? index : 1;
}

function getPaceLabel(pace: Pace | null): string {
  const index = getPaceIndex(pace);
  return PACE_OPTIONS[index]?.label ?? 'Moderate';
}

export function PaceIntensityPicker({ value, onChange }: PaceIntensityPickerProps) {
  const selectedIndex = getPaceIndex(value);
  const displayPace = value ?? PACE_VALUES[selectedIndex];
  const fillProgress = useSharedValue(selectedIndex / (PACE_VALUES.length - 1));
  const thumbProgress = useSharedValue(selectedIndex / (PACE_VALUES.length - 1));

  useEffect(() => {
    const pace = value ?? PACE_VALUES[selectedIndex];
    const index = getPaceIndex(pace);
    const optionProgress = index / (PACE_VALUES.length - 1);
    fillProgress.value = withTiming(optionProgress, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
    thumbProgress.value = withTiming(optionProgress, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [fillProgress, selectedIndex, thumbProgress, value]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    left: `${thumbProgress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text variant="h1" style={styles.percent}>
          {formatPacePercent(displayPace)}
        </Text>
        <Text variant="h2" style={styles.label}>
          {getPaceLabel(value)}
        </Text>
        <Text variant="bodyMuted" style={styles.hint}>
          Slide the intensity to match how quickly you want to move toward your goal.
        </Text>
      </View>

      <View
        accessibilityRole="adjustable"
        accessibilityLabel="Pace intensity"
        accessibilityValue={{
          min: 25,
          max: 100,
          now: paceToPercent(displayPace),
          text: getPaceLabel(value),
        }}
        style={styles.trackShell}
      >
        <View style={styles.trackHitArea}>
          <View style={styles.track}>
            <Animated.View style={[styles.trackFill, fillStyle]} />
            <Animated.View style={[styles.thumb, thumbStyle]} />
            {PACE_OPTIONS.map((option, index) => (
              <Pressable
                key={`track-${option.value}`}
                accessibilityRole="button"
                accessibilityLabel={`Set pace to ${option.label}`}
                onPress={() => onChange(option.value)}
                style={[
                  styles.trackStop,
                  {
                    left: `${(index / (PACE_OPTIONS.length - 1)) * 100}%`,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.tickRow}>
          {PACE_OPTIONS.map((option, index) => {
            const selected = selectedIndex === index;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.label}, ${option.description}`}
                onPress={() => onChange(option.value)}
                style={styles.tickPressable}
              >
                <View style={[styles.tickDot, selected && styles.tickDotSelected]} />
                <Text variant="label" style={[styles.tickPercent, selected && styles.tickSelected]}>
                  {formatPacePercent(option.value)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.chipRow}>
        {PACE_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text variant="body" style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const THUMB_SIZE = 28;

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  hero: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
  },
  percent: {
    color: colors.brandPrimary,
    fontSize: 48,
    lineHeight: 52,
  },
  label: {
    color: colors.textDark,
  },
  hint: {
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  trackShell: {
    gap: spacing.sm,
    paddingHorizontal: THUMB_SIZE / 2,
  },
  trackHitArea: {
    minHeight: 44,
    justifyContent: 'center',
  },
  track: {
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.borderLight,
    overflow: 'visible',
    justifyContent: 'center',
  },
  trackStop: {
    position: 'absolute',
    top: -16,
    width: 72,
    height: 44,
    marginLeft: -36,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    marginLeft: -THUMB_SIZE / 2,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.surfaceCanvas,
    borderWidth: 3,
    borderColor: colors.brandPrimary,
    shadowColor: colors.brandPrimary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tickPressable: {
    alignItems: 'center',
    gap: 6,
    minWidth: 72,
  },
  tickDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.borderLight,
  },
  tickDotSelected: {
    backgroundColor: colors.brandPrimary,
    transform: [{ scale: 1.2 }],
  },
  tickPercent: {
    color: colors.textMuted,
  },
  tickSelected: {
    color: colors.brandPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
  },
  chipSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: '#FFF8F7',
  },
  chipLabel: {
    color: colors.textMuted,
  },
  chipLabelSelected: {
    color: colors.brandPrimary,
  },
});
