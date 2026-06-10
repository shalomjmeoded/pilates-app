import { Pressable, StyleSheet, View } from 'react-native';
import { format, parseISO } from 'date-fns';

import { Text } from '@/components/ui/Text';
import { applyPortionToMeal } from '@/engines/nutrition';
import type { Meal } from '@/types/nutrition';
import { colors, radius, spacing } from '@/theme';

import { PortionControls } from './PortionControls';

interface MealCardProps {
  meal: Meal;
  onPortionChange: (mealId: string, multiplier: number) => void;
  onPortionStep: (mealId: string, direction: 1 | -1) => void;
  onEdit?: (mealId: string) => void;
  onDelete?: (mealId: string) => void;
  onDuplicate?: (mealId: string) => void;
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
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text variant="h2" style={styles.title}>
            {meal.title}
          </Text>
          <Text variant="bodyMuted">{timeLabel}</Text>
        </View>
        <Text variant="h2" style={styles.calories}>
          {Math.round(scaled.calories)} kcal
        </Text>
      </View>

      <Text variant="bodyMuted" style={styles.macros}>
        P {Math.round(scaled.proteinG)}g • C {Math.round(scaled.carbsG)}g • F {Math.round(scaled.fatG)}
        g • Fi {Math.round(scaled.fiberG)}g
      </Text>

      <PortionControls
        multiplier={meal.portionMultiplier}
        onChange={(value) => onPortionChange(meal.id, value)}
        onStep={(direction) => onPortionStep(meal.id, direction)}
      />

      {onEdit || onDelete || onDuplicate ? (
        <View style={styles.actions}>
          {onEdit ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${meal.title}`} onPress={() => onEdit(meal.id)} style={styles.actionButton}>
              <Text variant="label">Edit</Text>
            </Pressable>
          ) : null}
          {onDuplicate ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`Duplicate ${meal.title}`} onPress={() => onDuplicate(meal.id)} style={styles.actionButton}>
              <Text variant="label">Duplicate</Text>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${meal.title}`} onPress={() => onDelete(meal.id)} style={styles.actionButton}>
              <Text variant="label" style={styles.delete}>Delete</Text>
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
    borderColor: colors.borderLight,
    padding: spacing.sm,
    gap: spacing.xs,
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  calories: {
    color: colors.brandPrimary,
  },
  macros: {
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  delete: {
    color: colors.brandPrimary,
  },
});
