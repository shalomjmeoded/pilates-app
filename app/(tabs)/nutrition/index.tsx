import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  MealCard,
  NutritionDayHeader,
  NutritionEmptyState,
  RemainingCaloriesHero,
} from '@/components/nutrition';
import { WeekCalendarStrip } from '@/components/workout';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { LoadErrorState } from '@/components/ui/LoadErrorState';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import {
  deleteMeal,
  duplicateMeal,
  getRecentMeals,
  updateMealPortion,
} from '@/db/repositories/nutritionRepository';
import type { Meal } from '@/types/nutrition';
import { adjustPortionByStep, clampPortion } from '@/engines/nutrition';
import { getCalendarDates } from '@/engines/workout';
import { NutritionPreviewGate } from '@/components/premium';
import { useNutritionDay } from '@/hooks/useNutritionDay';
import { usePremium } from '@/hooks/usePremium';
import { useNutritionStore } from '@/stores/nutritionStore';
import { colors, radius, spacing } from '@/theme';

const FAB_BOTTOM_PADDING = 88;

export default function NutritionScreen() {
  const router = useRouter();
  const selectedDate = useNutritionStore((state) => state.selectedDate);
  const setSelectedDate = useNutritionStore((state) => state.setSelectedDate);
  const calendarDates = useMemo(() => getCalendarDates(), []);
  const { summary, meals, isLoading, isRefreshing, error, reload } = useNutritionDay(selectedDate);
  const { hasAccess, requirePremium } = usePremium();
  const [recentMeals, setRecentMeals] = useState<Meal[]>([]);
  const [recentMealsExpanded, setRecentMealsExpanded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void getRecentMeals(10).then(setRecentMeals);
      void reload();
    }, [reload]),
  );

  const openAddMeal = () => {
    requirePremium('add_meal', () => {
      router.push({
        pathname: '/(tabs)/nutrition/add-meal',
        params: { mealDate: selectedDate },
      });
    });
  };

  const handlePortionChange = async (mealId: string, multiplier: number) => {
    await updateMealPortion(mealId, clampPortion(multiplier));
    await reload();
  };

  const handleDeleteMeal = (mealId: string) => {
    Alert.alert('Delete meal?', 'This will update your daily totals.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await deleteMeal(mealId);
            await reload();
          })();
        },
      },
    ]);
  };

  const handleDuplicateMeal = async (mealId: string) => {
    await duplicateMeal(mealId, selectedDate);
    await reload();
  };

  const handleQuickAddRecent = async (mealId: string) => {
    await duplicateMeal(mealId, selectedDate);
    await reload();
  };

  const handlePortionStep = async (mealId: string, direction: 1 | -1) => {
    const meal = meals.find((item) => item.id === mealId);
    if (!meal) {
      return;
    }
    await updateMealPortion(mealId, adjustPortionByStep(meal.portionMultiplier, direction));
    await reload();
  };

  if (error && !summary && !isLoading) {
    return (
      <Screen title="Nutrition">
        <LoadErrorState
          title="Couldn’t load nutrition"
          message="Your meal history and targets are still safe. Try reloading this day."
          onRetry={() => void reload()}
        />
      </Screen>
    );
  }

  if (!hasAccess && !isLoading) {
    return (
      <Screen title="Nutrition" subtitle="Nourishment shaped around your body.">
        <NutritionPreviewGate />
      </Screen>
    );
  }

  const listHeader = summary ? (
    <View style={styles.header}>
      <WeekCalendarStrip
        dates={calendarDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {isRefreshing ? <Text variant="bodyMuted">Updating day...</Text> : null}

      {error ? (
        <LoadErrorState
          title="Couldn’t refresh nutrition"
          message="Some nutrition details did not update. Try again when you’re ready."
          compact
          onRetry={() => void reload()}
        />
      ) : null}

      <RemainingCaloriesHero
        remainingCalories={summary.remainingCalories}
        targetCalories={summary.targets.calories}
        consumedCalories={summary.consumed.calories}
      />

      <NutritionDayHeader
        mealDate={selectedDate}
        mealCount={summary.mealCount}
        consumed={summary.consumed}
        targets={summary.targets}
      />

      {recentMeals.length > 0 ? (
        <View style={styles.recentWrap}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: recentMealsExpanded }}
            accessibilityLabel={recentMealsExpanded ? 'Collapse recent meals' : 'Expand recent meals'}
            onPress={() => setRecentMealsExpanded((current) => !current)}
            style={({ pressed }) => [styles.recentHeader, pressed && styles.pressed]}
          >
            <View style={styles.recentHeaderCopy}>
              <Text variant="label">Recent meals</Text>
              <Text variant="bodyMuted">{recentMeals.length} quick add options</Text>
            </View>
            <View style={styles.recentHeaderAction}>
              <Text variant="caption" style={styles.recentHeaderActionText}>
                Tap to add
              </Text>
              <MaterialCommunityIcons
                name={recentMealsExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.brandPrimary}
              />
            </View>
          </Pressable>
          {recentMealsExpanded ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
              {recentMeals.map((meal) => (
                <Pressable
                  key={`recent-${meal.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${meal.title} again`}
                  onPress={() => void handleQuickAddRecent(meal.id)}
                  style={({ pressed }) => [styles.recentChip, pressed && styles.pressed]}
                >
                  <Text variant="body" numberOfLines={1}>
                    {meal.title}
                  </Text>
                  <Text variant="bodyMuted">{Math.round(meal.calories)} kcal</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <View style={styles.sectionDot} />
          <Text variant="h2">Today&apos;s meals</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            requirePremium('saved_meals', () => router.push('/(tabs)/nutrition/saved-meals'))
          }
          style={styles.linkButton}
        >
          <Text variant="label">Saved meals</Text>
        </Pressable>
      </View>
    </View>
  ) : null;

  return (
    <Screen title="Nutrition" isLoading={isLoading} loadingLabel="Loading your day...">
      {summary ? (
        <>
          <FlatList
            style={styles.list}
            data={meals}
            keyExtractor={(meal) => meal.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={listHeader}
            ListEmptyComponent={<NutritionEmptyState />}
            renderItem={({ item: meal }) => (
              <MealCard
                meal={meal}
                onPortionChange={handlePortionChange}
                onPortionStep={handlePortionStep}
                onEdit={(mealId) =>
                  router.push({ pathname: '/(tabs)/nutrition/edit-meal', params: { mealId } })
                }
                onDelete={handleDeleteMeal}
                onDuplicate={(mealId) => void handleDuplicateMeal(mealId)}
              />
            )}
          />
          <FloatingActionButton label="Add Meal" onPress={openAddMeal} accessibilityLabel="Add a meal" />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: FAB_BOTTOM_PADDING,
  },
  header: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  linkButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceRose,
  },
  recentWrap: {
    gap: 8,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    minHeight: 48,
    borderRadius: radius.square,
    borderWidth: 1,
    borderColor: '#BBD4FF',
    backgroundColor: '#EAF2FF',
    paddingHorizontal: spacing.xs,
    paddingVertical: 8,
  },
  recentHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  recentHeaderAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentHeaderActionText: {
    color: '#2F6FDB',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  recentRow: {
    gap: spacing.xs,
  },
  recentChip: {
    backgroundColor: colors.surfacePeach,
    borderRadius: radius.square,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
    maxWidth: 160,
    gap: 2,
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brandSecondary,
  },
  pressed: {
    opacity: 0.86,
  },
});
