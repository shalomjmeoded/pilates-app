import { useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import type { RoadmapPoint } from '@/types/calculations';
import { colors, metrics, radius, spacing } from '@/theme';
import { displayWeight } from '@/utils/units';
import { selectionHaptic } from '@/utils/haptics';

interface RoadmapChartProps {
  points: RoadmapPoint[];
  goalWeightKg: number;
  weightUnit?: 'kg' | 'lb';
  targetDateLabel?: string;
  confidenceLabel?: string;
}

const CHART_HEIGHT = 220;
const PADDING = 28;
const MILESTONE_WEEKS = [0, 6, 12, 18, 24];

function buildSmoothPath(coordinates: Array<{ x: number; y: number }>): string {
  if (coordinates.length === 0) {
    return '';
  }
  if (coordinates.length === 1) {
    return `M ${coordinates[0].x} ${coordinates[0].y}`;
  }

  let path = `M ${coordinates[0].x} ${coordinates[0].y}`;
  for (let index = 1; index < coordinates.length; index += 1) {
    const previous = coordinates[index - 1];
    const current = coordinates[index];
    const midX = (previous.x + current.x) / 2;
    path += ` C ${midX} ${previous.y}, ${midX} ${current.y}, ${current.x} ${current.y}`;
  }
  return path;
}

function buildAreaPath(
  linePath: string,
  coordinates: Array<{ x: number; y: number }>,
  baselineY: number,
): string {
  if (coordinates.length === 0) {
    return '';
  }
  const last = coordinates[coordinates.length - 1];
  const first = coordinates[0];
  return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

export function RoadmapChart({
  points,
  goalWeightKg,
  weightUnit = 'kg',
  targetDateLabel,
  confidenceLabel,
}: RoadmapChartProps) {
  const [width, setWidth] = useState(0);
  const [activeWeek, setActiveWeek] = useState(12);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const chart = useMemo(() => {
    if (width <= 0 || points.length === 0) {
      return null;
    }

    const weights = points.map((point) => point.projectedWeightKg);
    const min = Math.min(...weights, goalWeightKg) - 1.5;
    const max = Math.max(...weights, goalWeightKg) + 1.5;
    const range = max - min || 1;
    const innerWidth = width - PADDING * 2;
    const baselineY = CHART_HEIGHT - PADDING;
    const indexDenominator = Math.max(points.length - 1, 1);

    const coordinates = points.map((point, index) => {
      const x = PADDING + (index / indexDenominator) * innerWidth;
      const y =
        CHART_HEIGHT -
        PADDING -
        ((point.projectedWeightKg - min) / range) * (CHART_HEIGHT - PADDING * 2);
      return { x, y, week: point.week, weight: point.projectedWeightKg };
    });

    const linePath = buildSmoothPath(coordinates);
    const areaPath = buildAreaPath(linePath, coordinates, baselineY);
    const goalY =
      CHART_HEIGHT -
      PADDING -
      ((goalWeightKg - min) / range) * (CHART_HEIGHT - PADDING * 2);
    return { coordinates, linePath, areaPath, goalY, min, max };
  }, [goalWeightKg, points, width]);

  const formatWeight = (kg: number) => displayWeight(kg, weightUnit);
  const active = chart ? chart.coordinates[activeWeek] ?? chart.coordinates[chart.coordinates.length - 1] : null;

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <Animated.View entering={FadeInUp.duration(260)} style={styles.metaRow}>
        {targetDateLabel ? (
          <View style={styles.metaBadge}>
            <Text variant="caption">{targetDateLabel}</Text>
          </View>
        ) : null}
        {confidenceLabel ? (
          <View style={[styles.metaBadge, styles.confidenceBadge]}>
            <Text variant="caption" numberOfLines={1}>
              {confidenceLabel}
            </Text>
          </View>
        ) : null}
      </Animated.View>

      <View style={styles.journeyRow}>
        <View style={styles.journeyNodeWrap}>
          <View style={[styles.journeyNode, styles.journeyNodeActive]} />
          <Text variant="caption">Now</Text>
        </View>
        <View style={styles.journeyLine} />
        <View style={styles.journeyNodeWrap}>
          <View style={styles.journeyNode} />
          <Text variant="caption">6w</Text>
        </View>
        <View style={styles.journeyLine} />
        <View style={styles.journeyNodeWrap}>
          <View style={styles.journeyNode} />
          <Text variant="caption">12w</Text>
        </View>
        <View style={styles.journeyLine} />
        <View style={styles.journeyNodeWrap}>
          <View style={[styles.journeyNode, styles.journeyNodeGoal]} />
          <Text variant="caption">Goal</Text>
        </View>
      </View>

      <Animated.View entering={FadeInUp.delay(70).duration(280)} style={styles.card}>
        {chart ? (
          <>
            <View style={styles.tooltip}>
              <Text variant="label" style={styles.tooltipLabel}>
                Week {active?.week ?? 0}
              </Text>
              <Text variant="h2" style={styles.tooltipValue}>
                {active ? formatWeight(active.weight) : ''}
              </Text>
            </View>
            <Svg width={width} height={CHART_HEIGHT}>
              <Defs>
                <LinearGradient id="roadmapFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={colors.brandSecondary} stopOpacity="0.32" />
                  <Stop offset="100%" stopColor={colors.brandSecondary} stopOpacity="0.02" />
                </LinearGradient>
              </Defs>
              <Line
                x1={PADDING}
                x2={width - PADDING}
                y1={chart.goalY}
                y2={chart.goalY}
                stroke={colors.accentWarm}
                strokeWidth={1.5}
                strokeDasharray="5 4"
              />
              <Path d={chart.areaPath} fill="url(#roadmapFill)" />
              <Path d={chart.linePath} fill="none" stroke={colors.brandPrimary} strokeWidth={3} />
              {MILESTONE_WEEKS.map((week) => {
                const point = chart.coordinates[week];
                if (!point) {
                  return null;
                }
                return (
                  <Circle
                    key={week}
                    cx={point.x}
                    cy={point.y}
                    r={activeWeek === week ? 6 : 4}
                    fill={activeWeek === week ? colors.accentWarm : colors.surfaceCanvas}
                    stroke={colors.brandPrimary}
                    strokeWidth={2}
                  />
                );
              })}
              {active ? <Circle cx={active.x} cy={active.y} r={7} fill={colors.brandPrimary} /> : null}
              <SvgText
                x={width - PADDING}
                y={chart.goalY - 8}
                fill={colors.accentWarm}
                fontSize="11"
                textAnchor="end"
              >
                Goal {formatWeight(goalWeightKg)}
              </SvgText>
            </Svg>
          </>
        ) : null}
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(120).duration(260)} style={styles.weekRow}>
        {MILESTONE_WEEKS.map((week) => (
          <Pressable
            key={week}
            accessibilityRole="button"
            accessibilityLabel={`Show week ${week} roadmap milestone`}
            accessibilityHint="Updates the highlighted milestone value above the chart"
            accessibilityState={{ selected: activeWeek === week }}
            onPress={() => {
              selectionHaptic();
              setActiveWeek(week);
            }}
            style={[styles.weekChip, activeWeek === week && styles.weekChipActive]}
          >
            <Text variant="label" style={activeWeek === week ? styles.weekChipTextActive : undefined}>
              Wk {week}
            </Text>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  metaRow: {
    gap: spacing.sm,
  },
  metaBadge: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    gap: 4,
  },
  confidenceBadge: {
    backgroundColor: colors.surfaceRose,
  },
  journeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  journeyNodeWrap: {
    alignItems: 'center',
    gap: 6,
  },
  journeyLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 6,
  },
  journeyNode: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceCanvas,
  },
  journeyNodeActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandPrimary,
  },
  journeyNodeGoal: {
    borderColor: colors.accentWarm,
    backgroundColor: colors.accentWarm,
  },
  card: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    paddingTop: spacing.sm,
  },
  tooltip: {
    paddingHorizontal: spacing.sm,
    gap: 2,
  },
  tooltipLabel: {
    color: colors.textMuted,
  },
  tooltipValue: {
    color: colors.brandPrimary,
  },
  weekRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  weekChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceCanvas,
    borderWidth: 1,
    borderColor: colors.borderLight,
    minHeight: metrics.touchTargetMin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekChipActive: {
    backgroundColor: colors.surfaceRose,
    borderColor: colors.brandPrimary,
  },
  weekChipTextActive: {
    color: colors.brandPrimary,
  },
});
