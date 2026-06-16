import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

const WORKOUT_PREVIEW = [
  {
    label: 'Bridge',
    source: require('../../../assets/exercises/thumbnails/Pelvic_Tilt_Into_Bridge.jpg'),
  },
  {
    label: 'Roll up',
    source: require('../../../assets/exercises/thumbnails/Pilates_Roll_Up.jpg'),
  },
  {
    label: 'Single leg',
    source: require('../../../assets/exercises/thumbnails/Single_Leg_Stretch.jpg'),
  },
] as const;

const CONTINUATION_PREVIEW = [
  require('../../../assets/exercises/thumbnails/Cat_Cow.jpg'),
  require('../../../assets/exercises/thumbnails/Pilates_Swimming.jpg'),
] as const;

interface PlanRevealHeroProps {
  calories: number;
  proteinG: number;
  workoutsPerWeek: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  statusMessage?: string;
}

export function PlanRevealHero({
  calories,
  proteinG,
  workoutsPerWeek,
  carbsG,
  fatG,
  fiberG,
  statusMessage,
}: PlanRevealHeroProps) {
  const { height } = useWindowDimensions();
  const compact = height < 760;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.readyStrip}>
        <View style={styles.readyIcon}>
          <MaterialCommunityIcons name="check" size={15} color="#FFFFFF" />
        </View>
        <Text variant="caption" style={styles.readyText}>
          Personalized plan generated
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <MaterialCommunityIcons name="yoga" size={20} color="#D85F7A" />
          <Text variant="h2" style={styles.sectionTitle}>
            Your workout program
          </Text>
        </View>
        <Text variant="caption" style={styles.sectionCaption}>
          14+ exercises across {workoutsPerWeek} weekly sessions.
        </Text>
      </View>

      <View style={[styles.workoutStrip, compact && styles.workoutStripCompact]}>
        <View style={styles.exerciseGhostStack} pointerEvents="none">
          {CONTINUATION_PREVIEW.map((source, index) => (
            <Image
              key={index}
              source={source}
              style={[styles.exerciseGhost, index === 1 && styles.exerciseGhostBack]}
              resizeMode="cover"
              accessible={false}
            />
          ))}
        </View>
        {WORKOUT_PREVIEW.map((item) => (
          <View key={item.label} style={styles.exerciseCard}>
            <Image source={item.source} style={styles.exerciseImage} resizeMode="cover" />
            <Text variant="caption" style={styles.exerciseLabel} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.programSummary}>
        <SummaryChip icon="calendar-check" value={`${workoutsPerWeek}x / week`} tone="blue" />
        <SummaryChip icon="clock-outline" value="~15-20 min" tone="green" />
      </View>

      <View style={styles.nutritionHeader}>
        <View style={styles.sectionTitleRow}>
          <MaterialCommunityIcons name="leaf" size={20} color="#D85F7A" />
          <Text variant="h2" style={styles.sectionTitle}>
            Your nutrition targets
          </Text>
        </View>
      </View>

      <View style={[styles.nutritionGrid, compact && styles.nutritionGridCompact]}>
        <View style={styles.calorieCard}>
          <View style={styles.fireIcon}>
            <MaterialCommunityIcons name="fire" size={20} color="#D85F7A" />
          </View>
          <Text variant="display" style={styles.calories} numberOfLines={1} adjustsFontSizeToFit>
            {calories.toLocaleString()}
          </Text>
          <Text variant="caption" style={styles.muted}>
            Calories
          </Text>
        </View>

        <View style={styles.macroGrid}>
          <MacroPill label="Protein" value={`${proteinG}g`} icon="fish" tone="blue" />
          <MacroPill label="Carbs" value={`${carbsG}g`} icon="carrot" tone="yellow" />
          <MacroPill label="Fat" value={`${fatG}g`} icon="egg-outline" tone="purple" />
          <MacroPill label="Fiber" value={`${fiberG}g`} icon="leaf" tone="green" />
        </View>
      </View>

      {statusMessage ? (
        <View style={styles.nutritionStatus}>
          <MaterialCommunityIcons name="check-circle" size={15} color="#24A35A" />
          <Text variant="caption" style={styles.nutritionStatusText} numberOfLines={1}>
            {statusMessage}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

interface SummaryChipProps {
  icon: 'calendar-check' | 'clock-outline';
  value: string;
  tone: 'blue' | 'green';
}

function SummaryChip({ icon, value, tone }: SummaryChipProps) {
  return (
    <View style={[styles.summaryChip, tone === 'blue' ? styles.summaryBlue : styles.summaryGreen]}>
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color={tone === 'blue' ? '#2F6FDB' : colors.accentCool}
      />
      <Text variant="label" style={styles.summaryText}>
        {value}
      </Text>
    </View>
  );
}

interface MacroPillProps {
  label: string;
  value: string;
  icon: 'fish' | 'carrot' | 'egg-outline' | 'leaf';
  tone: 'blue' | 'green' | 'yellow' | 'purple';
}

function MacroPill({ label, value, icon, tone }: MacroPillProps) {
  return (
    <View style={[styles.macroPill, macroToneStyles[tone]]}>
      <MaterialCommunityIcons name={icon} size={18} color={macroIconColors[tone]} />
      <Text variant="h2" style={styles.macroValue} numberOfLines={1}>
        {value}
      </Text>
      <Text variant="caption" style={styles.macroLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 7,
  },
  wrapCompact: {
    gap: 5,
  },
  readyStrip: {
    minHeight: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#BFE8CD',
    backgroundColor: '#ECF9F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  readyIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#24A35A',
  },
  readyText: {
    color: '#167A40',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  sectionHeader: {
    gap: 2,
  },
  nutritionHeader: {
    marginTop: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: '#D85F7A',
    fontSize: 18,
    lineHeight: 22,
  },
  sectionCaption: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 15,
  },
  workoutStrip: {
    position: 'relative',
    height: 88,
    flexDirection: 'row',
    gap: 7,
  },
  workoutStripCompact: {
    height: 76,
  },
  exerciseCard: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceRose,
    zIndex: 2,
  },
  exerciseGhostStack: {
    position: 'absolute',
    right: -6,
    top: -9,
    width: 94,
    height: 44,
    zIndex: 1,
  },
  exerciseGhost: {
    position: 'absolute',
    right: 30,
    top: 2,
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    opacity: 0.28,
    transform: [{ rotate: '-9deg' }],
  },
  exerciseGhostBack: {
    right: 0,
    top: 7,
    opacity: 0.2,
    transform: [{ rotate: '9deg' }],
  },
  exerciseImage: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.surfaceHero,
  },
  exerciseLabel: {
    minHeight: 21,
    color: colors.textStrong,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  programSummary: {
    flexDirection: 'row',
    gap: 7,
  },
  summaryChip: {
    flex: 1,
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  summaryBlue: {
    backgroundColor: '#EAF2FF',
    borderColor: '#BBD4FF',
  },
  summaryGreen: {
    backgroundColor: '#ECF9F1',
    borderColor: '#BFE8CD',
  },
  summaryText: {
    color: colors.textStrong,
  },
  nutritionGrid: {
    minHeight: 130,
    flexDirection: 'row',
    gap: 7,
  },
  nutritionGridCompact: {
    minHeight: 118,
  },
  calorieCard: {
    flex: 1.14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: '#E8A5B4',
    backgroundColor: '#FFF0F4',
    paddingHorizontal: 10,
  },
  fireIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCanvas,
  },
  calories: {
    color: '#D85F7A',
    fontSize: 36,
    lineHeight: 40,
    textAlign: 'center',
  },
  macroGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  macroPill: {
    width: '47.5%',
    minHeight: 61,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  macroValue: {
    color: colors.textStrong,
    fontSize: 18,
    lineHeight: 21,
  },
  macroLabel: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
  },
  muted: {
    color: colors.textMuted,
  },
  nutritionStatus: {
    minHeight: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#BFE8CD',
    backgroundColor: '#ECF9F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  nutritionStatusText: {
    color: '#167A40',
    fontFamily: 'PlusJakartaSans_600SemiBold',
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
  purple: {
    backgroundColor: '#F3EDF8',
    borderColor: '#D6C0E8',
  },
});

const macroIconColors = {
  blue: '#2F6FDB',
  green: colors.accentCool,
  yellow: '#E99B2D',
  purple: '#9B7BB8',
} as const;
