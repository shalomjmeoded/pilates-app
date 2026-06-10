import { useCallback, useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { MOTION, colors, radius, spacing } from '@/theme';
import { selectionHaptic } from '@/utils/haptics';
import { kgToLb } from '@/utils/units';

const TICK_WIDTH = 8;
const MIN_KG = 35;
const MAX_KG = 250;
const STEP_KG = 0.1;
const FINE_STEP_LB = 0.5;
const LB_PER_KG = 2.20462;
const VIEWPORT_WIDTH = 320;

interface HorizontalMeasurementRulerProps {
  valueKg: number;
  unit: 'kg' | 'lb';
  onChangeKg: (kg: number) => void;
  onToggleUnit: () => void;
}

function stepsCount(): number {
  return Math.round((MAX_KG - MIN_KG) / STEP_KG);
}

function kgFromOffset(offsetX: number): number {
  const raw = MIN_KG + (offsetX / TICK_WIDTH) * STEP_KG;
  const snapped = Math.round(raw / STEP_KG) * STEP_KG;
  return Math.min(MAX_KG, Math.max(MIN_KG, Math.round(snapped * 10) / 10));
}

function clampKg(kg: number): number {
  return Math.min(MAX_KG, Math.max(MIN_KG, kg));
}

function displayValue(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'kg') {
    return String(Math.round(kg * 10) / 10);
  }

  return String(kgToLb(kg));
}

export function HorizontalMeasurementRuler({
  valueKg,
  unit,
  onChangeKg,
  onToggleUnit,
}: HorizontalMeasurementRulerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const lastKg = useRef(valueKg);
  const hasMounted = useRef(false);
  const scale = useSharedValue(1);
  const padding = VIEWPORT_WIDTH / 2;
  const steps = stepsCount();

  const scrollToKg = useCallback((kg: number, animated = false) => {
    const offset = ((kg - MIN_KG) / STEP_KG) * TICK_WIDTH;
    scrollRef.current?.scrollTo({ x: offset, animated });
  }, []);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      lastKg.current = valueKg;
      scrollToKg(valueKg, false);
      return;
    }

    if (valueKg === lastKg.current) {
      return;
    }

    lastKg.current = valueKg;
    scrollToKg(valueKg, false);
  }, [scrollToKg, valueKg]);

  const animatedValueStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const kg = kgFromOffset(event.nativeEvent.contentOffset.x);
    if (kg !== lastKg.current) {
      selectionHaptic();
      lastKg.current = kg;
      scale.value = withTiming(1.04, { duration: MOTION.fast }, () => {
        scale.value = withTiming(1, { duration: MOTION.normal });
      });
    }
    onChangeKg(kg);
    scrollToKg(kg, true);
  };

  const adjustByStep = (direction: 1 | -1) => {
    const deltaKg = unit === 'kg' ? STEP_KG : FINE_STEP_LB / LB_PER_KG;
    const next = clampKg(valueKg + direction * deltaKg);
    selectionHaptic();
    lastKg.current = next;
    scale.value = withTiming(1.04, { duration: MOTION.fast }, () => {
      scale.value = withTiming(1, { duration: MOTION.normal });
    });
    onChangeKg(next);
    scrollToKg(next, true);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.valueWrap, animatedValueStyle]}>
        <Text variant="h1" style={styles.value}>
          {displayValue(valueKg, unit)}
        </Text>
        <Pressable accessibilityRole="button" onPress={onToggleUnit} style={styles.unitPill}>
          <Text variant="label" style={styles.unitLabel}>
            {unit.toUpperCase()}
          </Text>
        </Pressable>
      </Animated.View>

      <View style={styles.rulerShell}>
        <View style={styles.centerNeedle} pointerEvents="none" />
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={TICK_WIDTH}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          contentContainerStyle={{ paddingHorizontal: padding }}
        >
          {Array.from({ length: steps + 1 }, (_, index) => {
            const kg = Math.round((MIN_KG + index * STEP_KG) * 10) / 10;
            const major = Math.round(kg * 10) % 5 === 0;
            return (
              <View key={`${kg}-${index}`} style={[styles.tickCol, { width: TICK_WIDTH }]}>
                <View style={[styles.tick, major && styles.tickMajor]} />
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.nudgeRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease weight by ${unit === 'kg' ? '0.1 kilogram' : '0.5 pound'}`}
          onPress={() => adjustByStep(-1)}
          style={styles.nudge}
        >
          <Text variant="body">−</Text>
        </Pressable>
        <Text variant="bodyMuted" style={styles.nudgeHint}>
          Tap for {unit === 'kg' ? '0.1 kg' : '0.5 lb'} steps
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase weight by ${unit === 'kg' ? '0.1 kilogram' : '0.5 pound'}`}
          onPress={() => adjustByStep(1)}
          style={styles.nudge}
        >
          <Text variant="body">+</Text>
        </Pressable>
      </View>

      <Text variant="bodyMuted" style={styles.hint}>
        Drag the ruler for broad changes, then tap to fine-tune.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  valueWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  value: {
    fontSize: 52,
    lineHeight: 56,
    color: colors.brandPrimary,
  },
  unitPill: {
    marginBottom: 8,
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
    height: 88,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  centerNeedle: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    left: '50%',
    width: 2,
    marginLeft: -1,
    backgroundColor: colors.brandPrimary,
    zIndex: 2,
    borderRadius: 1,
  },
  tickCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingBottom: spacing.sm,
  },
  tick: {
    width: 1,
    height: 14,
    backgroundColor: colors.borderLight,
  },
  tickMajor: {
    height: 24,
    width: 2,
    backgroundColor: colors.textMuted,
  },
  nudgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
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
  nudgeHint: {
    flex: 1,
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
});
