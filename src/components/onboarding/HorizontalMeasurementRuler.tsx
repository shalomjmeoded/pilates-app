import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { MOTION, colors, metrics, radius, spacing } from '@/theme';
import { selectionHaptic } from '@/utils/haptics';
import { kgToLb } from '@/utils/units';

const TICK_WIDTH = 10;
const MIN_KG = 35;
const MAX_KG = 250;
const LB_PER_KG = 2.20462;
const KG_STEP = 0.2;
const LB_STEP = 0.5;
const VIEWPORT_WIDTH = 320;

interface HorizontalMeasurementRulerProps {
  valueKg: number;
  unit: 'kg' | 'lb';
  onChangeKg: (kg: number) => void;
  onToggleUnit: () => void;
  minKg?: number;
  maxKg?: number;
  accessibilityLabel?: string;
}

interface TickItem {
  key: string;
  major: boolean;
}

function stepsCount(minKg: number, maxKg: number, stepKg: number): number {
  return Math.round((maxKg - minKg) / stepKg);
}

function kgFromOffset(offsetX: number, stepKg: number, minKg: number, maxKg: number): number {
  const raw = minKg + (offsetX / TICK_WIDTH) * stepKg;
  const snapped = Math.round(raw / stepKg) * stepKg;
  return Math.min(maxKg, Math.max(minKg, Math.round(snapped * 10) / 10));
}

function clampKg(kg: number, minKg: number, maxKg: number): number {
  return Math.min(maxKg, Math.max(minKg, kg));
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
  minKg = MIN_KG,
  maxKg = MAX_KG,
  accessibilityLabel = 'Weight ruler',
}: HorizontalMeasurementRulerProps) {
  const listRef = useRef<FlatList<TickItem>>(null);
  const lastKg = useRef(valueKg);
  const hasMounted = useRef(false);
  const isInteracting = useRef(false);
  const scale = useSharedValue(1);
  const padding = VIEWPORT_WIDTH / 2;
  const stepKg = unit === 'kg' ? KG_STEP : LB_STEP / LB_PER_KG;
  const clampedValueKg = clampKg(valueKg, minKg, maxKg);
  const steps = stepsCount(minKg, maxKg, stepKg);
  const tickData = useMemo(() => {
    return Array.from({ length: steps + 1 }, (_, index) => {
      const kg = minKg + index * stepKg;
      const displayMagnitude = unit === 'kg' ? kg : kgToLb(kg);
      const major =
        unit === 'kg'
          ? Math.round(displayMagnitude * 10) % 10 === 0
          : Math.round(displayMagnitude * 10) % 50 === 0;

      return {
        key: `${kg.toFixed(2)}-${index}`,
        major,
      };
    });
  }, [minKg, stepKg, steps, unit]);

  const scrollToKg = useCallback((kg: number, animated = false) => {
    const offset = ((clampKg(kg, minKg, maxKg) - minKg) / stepKg) * TICK_WIDTH;
    listRef.current?.scrollToOffset({ offset, animated });
  }, [maxKg, minKg, stepKg]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      lastKg.current = clampedValueKg;
      scrollToKg(clampedValueKg, false);
      return;
    }

    if (isInteracting.current || clampedValueKg === lastKg.current) {
      return;
    }

    lastKg.current = clampedValueKg;
    scrollToKg(clampedValueKg, false);
  }, [clampedValueKg, scrollToKg]);

  const animatedValueStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseValue = () => {
    scale.value = withTiming(1.04, { duration: MOTION.fast }, () => {
      scale.value = withTiming(1, { duration: MOTION.normal });
    });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const kg = kgFromOffset(event.nativeEvent.contentOffset.x, stepKg, minKg, maxKg);
    if (kg !== lastKg.current) {
      selectionHaptic();
      lastKg.current = kg;
      pulseValue();
      onChangeKg(kg);
    }
  };

  const handleScrollStart = () => {
    isInteracting.current = true;
  };

  const handleScrollEnd = () => {
    isInteracting.current = false;
  };

  const adjustByStep = (direction: 1 | -1) => {
    const next = clampKg(clampedValueKg + direction * stepKg, minKg, maxKg);
    selectionHaptic();
    lastKg.current = next;
    pulseValue();
    onChangeKg(next);
    scrollToKg(next, true);
  };

  const renderTick = ({ item }: ListRenderItemInfo<TickItem>) => (
    <View style={[styles.tickCol, { width: TICK_WIDTH }]}>
      <View style={[styles.tick, item.major && styles.tickMajor]} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.valueWrap, animatedValueStyle]}>
        <Text variant="h1" style={styles.value}>
          {displayValue(clampedValueKg, unit)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${unit === 'kg' ? 'pounds' : 'kilograms'}`}
          onPress={() => {
            selectionHaptic();
            onToggleUnit();
          }}
          style={styles.unitPill}
        >
          <Text variant="label" style={styles.unitLabel}>
            {unit.toUpperCase()}
          </Text>
        </Pressable>
      </Animated.View>

      <View
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min: minKg, max: maxKg, now: clampedValueKg, text: displayValue(clampedValueKg, unit) }}
        style={styles.rulerShell}
      >
        <View style={styles.centerNeedle} pointerEvents="none" />
        <FlatList
          ref={listRef}
          data={tickData}
          keyExtractor={(item) => item.key}
          renderItem={renderTick}
          horizontal
          directionalLockEnabled
          alwaysBounceHorizontal={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={TICK_WIDTH}
          getItemLayout={(_, index) => ({
            length: TICK_WIDTH,
            offset: TICK_WIDTH * index,
            index,
          })}
          initialNumToRender={140}
          maxToRenderPerBatch={120}
          windowSize={7}
          removeClippedSubviews
          decelerationRate="normal"
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollStart}
          onMomentumScrollBegin={handleScrollStart}
          onScrollEndDrag={handleScrollEnd}
          onMomentumScrollEnd={handleScrollEnd}
          contentContainerStyle={{ paddingHorizontal: padding }}
        />
      </View>

      <View style={styles.nudgeRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease weight by ${unit === 'kg' ? '0.2 kilogram' : '0.5 pound'}`}
          onPress={() => adjustByStep(-1)}
          style={styles.nudge}
        >
          <Text variant="body">−</Text>
        </Pressable>
        <Text variant="bodyMuted" style={styles.nudgeHint}>
          Tap for {unit === 'kg' ? '0.2 kg' : '0.5 lb'} steps
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase weight by ${unit === 'kg' ? '0.2 kilogram' : '0.5 pound'}`}
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
    width: metrics.touchTargetMin,
    height: metrics.touchTargetMin,
    borderRadius: metrics.touchTargetMin / 2,
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
});
