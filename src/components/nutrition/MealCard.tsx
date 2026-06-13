import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { format, parseISO } from 'date-fns';

import { Text } from '@/components/ui/Text';
import { applyPortionToMeal } from '@/engines/nutrition';
import type { Meal } from '@/types/nutrition';
import { colors, radius, shadows, spacing } from '@/theme';

import { PortionControls } from './PortionControls';

interface MealCardProps {
  meal: Meal;
  onPortionChange: (mealId: string, multiplier: number) => void;
  onPortionStep: (mealId: string, direction: 1 | -1) => void;
  onEdit?: (mealId: string) => void;
  onDelete?: (mealId: string) => void;
  onDuplicate?: (mealId: string) => void;
}

function mealIconName(title: string): keyof typeof Feather.glyphMap {
  const lower = title.toLowerCase();
  if (lower.includes('breakfast') || lower.includes('oat')) {
    return 'sunrise';
  }
  if (lower.includes('lunch') || lower.includes('salad')) {
    return 'sun';
  }
  if (lower.includes('dinner') || lower.includes('soup')) {
    return 'moon';
  }
  if (lower.includes('snack') || lower.includes('bar')) {
    return 'coffee';
  }
  return 'feather';
}

export function MealCard({
  meal,
  onPortionChange,
  onPortionStep,
  onEdit,
  onDelete,
  onDuplicate,
}: MealCardProps) {
  const scaled = applyPortionToMeal(meal);
  const timeLabel = format(parseISO(meal.loggedAt), 'h:mm a');

  return (
    <View style={[styles.card, shadows.card]}>
      <View style={styles.header}>
        <View style={styles.mediaRow}>
          <View style={styles.imagePlaceholder}>
            <Feather name={mealIconName(meal.title)} size={22} color={colors.brandSecondary} />
          </View>
          <View style={styles.titleWrap}>
            <Text variant="h2" style={styles.title}>
              {meal.title}
            </Text>
            <Text variant="bodyMuted">{timeLabel}</Text>
          </View>
        </View>
        {onEdit ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${meal.title}`}
            onPress={() => onEdit(meal.id)}
            style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
          >
            <Feather name="edit-2" size={18} color={colors.brandPrimary} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.macroRow}>
        <Text variant="bodyMuted" style={styles.macros}>
          P {Math.round(scaled.proteinG)}g · C {Math.round(scaled.carbsG)}g · F{' '}
          {Math.round(scaled.fatG)}g
        </Text>
        <Text variant="h2" style={styles.calories}>
          {Math.round(scaled.calories)} kcal
        </Text>
      </View>

      <PortionControls
        multiplier={meal.portionMultiplier}
        onChange={(value) => onPortionChange(meal.id, value)}
        onStep={(direction) => onPortionStep(meal.id, direction)}
      />

      {onDelete || onDuplicate ? (
        <View style={styles.actions}>
          {onDuplicate ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Duplicate ${meal.title}`}
              onPress={() => onDuplicate(meal.id)}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <Text variant="label">Duplicate</Text>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Delete ${meal.title}`}
              onPress={() => onDelete(meal.id)}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <Text variant="label" style={styles.delete}>
                Delete
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  mediaRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: radius.square,
    backgroundColor: colors.surfaceRose,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.square,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  macros: {
    flex: 1,
  },
  calories: {
    color: colors.brandPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  delete: {
    color: colors.destructive,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
