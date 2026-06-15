import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

interface PlanRevealHeroProps {
  calories: number;
  proteinG: number;
  workoutsPerWeek: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export function PlanRevealHero({
  calories,
  proteinG,
  workoutsPerWeek,
  carbsG,
  fatG,
  fiberG,
}: PlanRevealHeroProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.readyStrip}>
        <View style={styles.readyIcon}>
          <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
        </View>
        <Text variant="label" style={styles.readyText}>
          Personalized plan generated
        </Text>
      </View>

      <View style={styles.topGrid}>
        <View style={[styles.planPanel, styles.workoutPanel]}>
          <View style={styles.panelHeader}>
            <View style={[styles.panelIcon, styles.blueIcon]}>
              <MaterialCommunityIcons name="calendar-check" size={18} color="#2F6FDB" />
            </View>
            <Text variant="label" style={styles.blueText}>
              Workouts
            </Text>
          </View>
          <Text variant="display" style={styles.workoutCount} numberOfLines={1}>
            {workoutsPerWeek}
          </Text>
          <Text variant="caption" style={styles.panelCaption}>
            Pilates sessions / week
          </Text>
        </View>

        <View style={[styles.planPanel, styles.caloriePanel]}>
          <View style={styles.panelHeader}>
            <View style={[styles.panelIcon, styles.yellowIcon]}>
              <MaterialCommunityIcons name="fire" size={18} color="#B77900" />
            </View>
            <Text variant="label" style={styles.yellowText}>
              Calories
            </Text>
          </View>
          <Text variant="display" style={styles.calories} numberOfLines={1}>
            {calories}
          </Text>
          <Text variant="caption" style={styles.panelCaption}>
            daily target
          </Text>
        </View>
      </View>

      <View style={styles.macroGrid}>
        <MacroPill label="Protein" value={`${proteinG}g`} tone="green" />
        <MacroPill label="Carbs" value={`${carbsG}g`} tone="blue" />
        <MacroPill label="Fat" value={`${fatG}g`} tone="yellow" />
        <MacroPill label="Fiber" value={`${fiberG}g`} tone="green" />
      </View>
    </View>
  );
}

interface MacroPillProps {
  label: string;
  value: string;
  tone: 'blue' | 'green' | 'yellow';
}

function MacroPill({ label, value, tone }: MacroPillProps) {
  return (
    <View style={[styles.macroPill, macroToneStyles[tone]]}>
      <Text variant="h2" style={styles.macroValue} numberOfLines={1}>
        {value}
      </Text>
      <Text variant="caption" style={styles.macroLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  readyStrip: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#BFE8CD',
    backgroundColor: '#ECF9F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  readyIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#24A35A',
  },
  readyText: {
    color: '#167A40',
  },
  topGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  planPanel: {
    flex: 1,
    minHeight: 124,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  workoutPanel: {
    borderColor: '#BBD4FF',
    backgroundColor: '#EAF2FF',
  },
  caloriePanel: {
    borderColor: '#F4DC7D',
    backgroundColor: '#FFF7D7',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  panelIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCanvas,
  },
  blueIcon: {
    borderWidth: 1,
    borderColor: '#BBD4FF',
  },
  yellowIcon: {
    borderWidth: 1,
    borderColor: '#F4DC7D',
  },
  blueText: {
    color: '#2F6FDB',
  },
  yellowText: {
    color: '#B77900',
  },
  workoutCount: {
    color: '#2F6FDB',
    fontSize: 48,
    lineHeight: 52,
    textAlign: 'center',
  },
  calories: {
    color: '#B77900',
    fontSize: 42,
    lineHeight: 48,
    textAlign: 'center',
  },
  panelCaption: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  macroPill: {
    width: '48.9%',
    minHeight: 62,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  macroValue: {
    color: colors.textStrong,
    fontSize: 21,
    lineHeight: 25,
  },
  macroLabel: {
    color: colors.textMuted,
  },
});

const macroToneStyles = StyleSheet.create({
  blue: {
    backgroundColor: '#EAF2FF',
    borderColor: '#BBD4FF',
  },
  green: {
    backgroundColor: '#ECF9F1',
    borderColor: '#BFE8CD',
  },
  yellow: {
    backgroundColor: '#FFF7D7',
    borderColor: '#F4DC7D',
  },
});
