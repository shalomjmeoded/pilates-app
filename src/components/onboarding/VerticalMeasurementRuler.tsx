import { useCallback, useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';
import { selectionHaptic } from '@/utils/haptics';
import { cmToInches } from '@/utils/units';

const TICK_HEIGHT = 10;
const MIN_CM = 120;
const MAX_CM = 230;
const VIEWPORT_HEIGHT = 260;

interface VerticalMeasurementRulerProps {
  valueCm: number;
  unit: 'cm' | 'in';
  onChangeCm: (cm: number) => void;
  onToggleUnit: () => void;
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
  onToggleUnit,
}: VerticalMeasurementRulerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const lastCm = useRef(valueCm);
  const hasMounted = useRef(false);
  const isUserScrolling = useRef(false);
  const padding = (VIEWPORT_HEIGHT - TICK_HEIGHT) / 2;
  const steps = MAX_CM - MIN_CM;

  const scrollToCm = useCallback((cm: number, animated = false) => {
    const offset = (cm - MIN_CM) * TICK_HEIGHT;
    scrollRef.current?.scrollTo({ y: offset, animated });
  }, []);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      lastCm.current = valueCm;
      scrollToCm(valueCm, false);
      return;
    }

    if (isUserScrolling.current || valueCm === lastCm.current) {
      return;
    }

    lastCm.current = valueCm;
    scrollToCm(valueCm, false);
  }, [scrollToCm, valueCm]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const cm = cmFromOffset(event.nativeEvent.contentOffset.y);
    if (cm !== lastCm.current) {
      selectionHaptic();
      lastCm.current = cm;
      onChangeCm(cm);
    }
  };

  const handleScrollBegin = () => {
    isUserScrolling.current = true;
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const cm = cmFromOffset(event.nativeEvent.contentOffset.y);
    isUserScrolling.current = false;
    if (cm !== lastCm.current) {
      selectionHaptic();
      lastCm.current = cm;
      onChangeCm(cm);
    }
    scrollToCm(cm, true);
  };

  const handleDragEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const velocityY = Math.abs(event.nativeEvent.velocity?.y ?? 0);
    if (velocityY < 0.05) {
      handleScrollEnd(event);
    }
  };

  const adjustByStep = (delta: number) => {
    const next = Math.min(MAX_CM, Math.max(MIN_CM, valueCm + delta));
    selectionHaptic();
    lastCm.current = next;
    onChangeCm(next);
    scrollToCm(next, true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.valueRow}>
        <Text variant="h1" style={styles.value}>
          {displayValue(valueCm, unit)}
        </Text>
        <Pressable accessibilityRole="button" onPress={onToggleUnit} style={styles.unitPill}>
          <Text variant="label" style={styles.unitLabel}>
            {unit.toUpperCase()}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.rulerShell, { height: VIEWPORT_HEIGHT }]}>
        <View style={styles.centerIndicator} pointerEvents="none" />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={TICK_HEIGHT}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollBegin={handleScrollBegin}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleDragEnd}
          contentContainerStyle={{ paddingVertical: padding }}
        >
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
        </ScrollView>
      </View>

      <View style={styles.nudgeRow}>
        <Pressable accessibilityRole="button" onPress={() => adjustByStep(-1)} style={styles.nudge}>
          <Text variant="body">−</Text>
        </Pressable>
        <Text variant="bodyMuted">Scroll or tap to fine-tune</Text>
        <Pressable accessibilityRole="button" onPress={() => adjustByStep(1)} style={styles.nudge}>
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
  tickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
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
    minWidth: 36,
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
