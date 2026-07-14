import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { AddMealOptionsGrid } from '@/components/nutrition';
import { colors, spacing, createDynamicStyles } from '@/theme';

/** Deep-link / fallback entry — primary UX is the in-tab AddMealSheet. */
export default function AddMealHubScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mealDate: string }>();
  const mealDate = params.mealDate ?? new Date().toISOString().slice(0, 10);

  const closeToNutrition = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace({
      pathname: '/(tabs)/nutrition',
      params: { mealDate },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar onPress={closeToNutrition} />
      <View style={styles.container}>
        <AddMealOptionsGrid mealDate={mealDate} />
      </View>
    </SafeAreaView>
  );
}

const styles = createDynamicStyles(() => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.sm,
    paddingBottom: spacing.lg,
  },
}));
