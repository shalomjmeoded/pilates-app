import { useEffect, useRef } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, metrics, radius, spacing } from '@/theme';
import { selectionHaptic } from '@/utils/haptics';
import { cmToInches } from '@/utils/units';

const TICK_HEIGHT = 12;
const MIN_CM = 120;
const MAX_CM = 230;
const DEFAULT_VIEWPORT_HEIGHT = 240;

interface VerticalMeasurementRulerProps {
  valueCm: number;
  unit: 'cm' | 'in';
  onChangeCm: (cm: number) => void;
  selectedSystem: 'metric' | 'imperial';
  onSelectSystem: (metric: boolean) => void;
  viewportHeight?: number;
}

function displayValue(cm: number, unit: 'cm' | 'in'): string {
  if (unit === 'cm') {
    return String(Math.round(cm));
  }
  return String(Math.round(cmToInches(cm) * 10) / 10);
}

function cmFromOffset(offsetY: number): number {
  const raw = MIN_CM + offsetY / TICK_HEIGHT;
  return Math.min(MAX_CM, Math.max(MIN_CM, Math.round(raw)));
}

export function VerticalMeasurementRuler({
  valueCm,
  unit,
  onChangeCm,
  selectedSystem,
  onSelectSystem,
  viewportHeight = DEFAULT_VIEWPORT_HEIGHT,
}: VerticalMeasurementRulerProps) {
  const lastCm = useRef(valueCm);
  const gestureStartCm = useRef(valueCm);
  const padding = (viewportHeight - TICK_HEIGHT) / 2;
  const steps = MAX_CM - MIN_CM;

  useEffect(() => {
    lastCm.current = valueCm;
  }, [valueCm]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
      onPanResponderGrant: () => {
        gestureStartCm.current = lastCm.current;
      },
      onPanResponderMove: (_, gesture) => {
        const cm = cmFromOffset((gestureStartCm.current - MIN_CM) * TICK_HEIGHT - gesture.dy);
        if (cm !== lastCm.current) {
          selectionHaptic();
          lastCm.current = cm;
          onChangeCm(cm);
        }
      },
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  const adjustByStep = (delta: number) => {
    const next = Math.min(MAX_CM, Math.max(MIN_CM, valueCm + delta));
    selectionHaptic();
    lastCm.current = next;
    onChangeCm(next);
  };

  const rulerOffset = padding - (valueCm - MIN_CM) * TICK_HEIGHT;

  return (
    <View style={styles.container}>
      <View style={styles.segmentedControl}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: selectedSystem === 'metric' }}
          onPress={() => onSelectSystem(true)}
          style={[
            styles.segment,
            selectedSystem === 'metric' && styles.segmentSelected,
          ]}
        >
          <Text
            variant="label"
            style={selectedSystem === 'metric' ? styles.segmentLabelSelected : styles.segmentLabel}
          >
            Metric
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: selectedSystem === 'imperial' }}
          onPress={() => onSelectSystem(false)}
          style={[
            styles.segment,
            selectedSystem === 'imperial' && styles.segmentSelected,
          ]}
        >
          <Text
            variant="label"
            style={selectedSystem === 'imperial' ? styles.segmentLabelSelected : styles.segmentLabel}
          >
            Imperial
          </Text>
        </Pressable>
      </View>

      <View style={styles.valueRow}>
        <Text variant="h1" style={styles.value}>
          {displayValue(valueCm, unit)}
        </Text>
        <View style={styles.unitPill}>
          <Text variant="label" style={styles.unitLabel}>
            {unit.toUpperCase()}
          </Text>
        </View>
      </View>

      <View
        accessibilityRole="adjustable"
        accessibilityLabel="Height ruler"
        accessibilityValue={{ min: MIN_CM, max: MAX_CM, now: valueCm, text: displayValue(valueCm, unit) }}
        style={[styles.rulerShell, { height: viewportHeight }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.centerIndicator} pointerEvents="none" />
        <View style={[styles.rulerTicks, { transform: [{ translateY: rulerOffset }] }]}>
          {Array.from({ length: steps + 1 }, (_, index) => {
            const cm = MIN_CM + index;
            const major = cm % 5 === 0;
            return (
              <View key={cm} style={[styles.tickRow, { height: TICK_HEIGHT }]}>
                <View style={[styles.tick, major && styles.tickMajor]} />
                {major ? (
                  <Text variant="label" style={styles.tickLabel}>
                    {unit === 'cm' ? cm : Math.round(cmToInches(cm))}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.nudgeRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease height by ${unit === 'cm' ? '1 centimeter' : '0.4 inch'}`}
          onPress={() => adjustByStep(-1)}
          style={styles.nudge}
        >
          <Text variant="body">−</Text>
        </Pressable>
        <Text variant="bodyMuted">Drag or tap to fine-tune</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase height by ${unit === 'cm' ? '1 centimeter' : '0.4 inch'}`}
          onPress={() => adjustByStep(1)}
          style={styles.nudge}
        >
          <Text variant="body">+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    minHeight: metrics.touchTargetMin,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  segmentSelected: {
    backgroundColor: colors.surfaceRose,
  },
  segmentLabel: {
    color: colors.textMuted,
  },
  segmentLabelSelected: {
    color: colors.brandPrimary,
  },
  value: {
    fontSize: 56,
    lineHeight: 60,
    color: colors.brandPrimary,
  },
  unitPill: {
    marginBottom: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceCanvas,
    borderWidth: 1,
    borderColor: colors.borderLight,
    minWidth: 48,
    alignItems: 'center',
  },
  unitLabel: {
    color: colors.brandPrimary,
  },
  rulerShell: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  centerIndicator: {
    position: 'absolute',
    top: '50%',
    left: spacing.sm,
    right: spacing.sm,
    marginTop: -1,
    height: 2,
    backgroundColor: colors.brandPrimary,
    zIndex: 2,
  },
  rulerTicks: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  tickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    gap: spacing.sm,
  },
  tick: {
    width: 18,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  tickMajor: {
    width: 32,
    height: 2,
    backgroundColor: colors.textMuted,
  },
  tickLabel: {
    color: colors.textMuted,
    minWidth: 48,
    textAlign: 'right',
    fontSize: 11,
    lineHeight: 12,
    letterSpacing: 0,
    textTransform: 'none',
  },
  nudgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nudge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceCanvas,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
