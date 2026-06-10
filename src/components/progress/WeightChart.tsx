import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { buildChartLayout, filterLogsByRange } from '@/engines/progress';
import type { WeightChartRange, WeightLog } from '@/types/progress';
import { colors, spacing } from '@/theme';
import { displayWeight } from '@/utils/units';

import { WeightChartRangeSwitcher } from './WeightChartRangeSwitcher';

interface WeightChartProps {
  logs: WeightLog[];
  goalWeightKg: number;
  range: WeightChartRange;
  onRangeChange: (range: WeightChartRange) => void;
  weightUnit: 'kg' | 'lb';
}

const CHART_HEIGHT = 200;

export function WeightChart({
  logs,
  goalWeightKg,
  range,
  onRangeChange,
  weightUnit,
}: WeightChartProps) {
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = Math.max(280, windowWidth - spacing.sm * 4);

  const filteredLogs = useMemo(() => filterLogsByRange(logs, range), [logs, range]);
  const layout = useMemo(
    () => buildChartLayout(filteredLogs, goalWeightKg, chartWidth, CHART_HEIGHT),
    [filteredLogs, goalWeightKg, chartWidth],
  );

  const latestPoint = layout.points[layout.points.length - 1];

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text variant="h2">Weight trend</Text>
        <WeightChartRangeSwitcher value={range} onChange={onRangeChange} />
      </View>

      <Svg width={chartWidth} height={CHART_HEIGHT} style={styles.chart}>
        <Defs>
          <LinearGradient id="weightLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.brandPrimary} />
            <Stop offset="100%" stopColor={colors.accentWarm} />
          </LinearGradient>
        </Defs>

        {layout.path ? (
          <>
            <Line
              x1={24}
              x2={chartWidth - 24}
              y1={layout.goalY}
              y2={layout.goalY}
              stroke={colors.accentCool}
              strokeDasharray="6 6"
              strokeWidth={1.5}
            />
            <Path d={layout.path} stroke="url(#weightLine)" strokeWidth={3} fill="none" />
            {layout.points.map((point, index) => (
              <Circle
                key={`${point.date}-${index}`}
                cx={point.x}
                cy={point.y}
                r={4}
                fill={colors.surfaceCanvas}
                stroke={colors.brandPrimary}
                strokeWidth={2}
              />
            ))}
            {latestPoint ? (
              <Circle
                cx={latestPoint.x}
                cy={latestPoint.y}
                r={7}
                fill={colors.brandPrimary}
                stroke={colors.surfaceCanvas}
                strokeWidth={2}
              />
            ) : null}
          </>
        ) : null}
      </Svg>

      <View style={styles.legend}>
        <Text variant="bodyMuted">Goal {displayWeight(goalWeightKg, weightUnit)}</Text>
        {latestPoint ? (
          <Text variant="bodyMuted">
            Current {displayWeight(latestPoint.weightKg, weightUnit)}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  header: {
    gap: spacing.sm,
  },
  chart: {
    alignSelf: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
