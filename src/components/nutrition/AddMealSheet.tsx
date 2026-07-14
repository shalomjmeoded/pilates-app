import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { usePremium } from '@/hooks/usePremium';
import type { PremiumFeatureKey } from '@/types/premium';
import { colors, metrics, radius, spacing, createDynamicStyles } from '@/theme';

type AddMealOptionId = 'text' | 'photo' | 'quick' | 'saved';

interface AddMealOption {
  id: AddMealOptionId;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  feature: PremiumFeatureKey;
  pathname:
    | '/(tabs)/nutrition/add-text-estimate'
    | '/(tabs)/nutrition/add-photo-estimate'
    | '/(tabs)/nutrition/add-manual'
    | '/(tabs)/nutrition/saved-meals';
}

const OPTIONS: AddMealOption[] = [
  {
    id: 'text',
    label: 'Text',
    icon: 'text-recognition',
    feature: 'ai_meal_text',
    pathname: '/(tabs)/nutrition/add-text-estimate',
  },
  {
    id: 'photo',
    label: 'Photo',
    icon: 'camera-outline',
    feature: 'ai_meal_photo',
    pathname: '/(tabs)/nutrition/add-photo-estimate',
  },
  {
    id: 'quick',
    label: 'Quick Add',
    icon: 'pencil-plus-outline',
    feature: 'add_meal',
    pathname: '/(tabs)/nutrition/add-manual',
  },
  {
    id: 'saved',
    label: 'Saved',
    icon: 'bookmark-outline',
    feature: 'saved_meals',
    pathname: '/(tabs)/nutrition/saved-meals',
  },
];

const DISMISS_DISTANCE = 96;
const DISMISS_VELOCITY = 1.05;

interface AddMealSheetProps {
  visible: boolean;
  mealDate: string;
  onClose: () => void;
}

export function AddMealSheet({ visible, mealDate, onClose }: AddMealSheetProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requirePremium } = usePremium();
  const windowHeight = Dimensions.get('window').height;
  const paddingBottom = Math.max(insets.bottom, spacing.md);
  const translateY = useRef(new Animated.Value(0)).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!visible) {
      translateY.setValue(0);
    }
  }, [visible, translateY]);

  const dismiss = () => {
    onCloseRef.current();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          translateY.setValue(Math.max(0, gesture.dy));
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldClose =
            gesture.dy > DISMISS_DISTANCE || (gesture.vy > DISMISS_VELOCITY && gesture.dy > 40);
          if (shouldClose) {
            Animated.timing(translateY, {
              toValue: windowHeight,
              duration: 180,
              useNativeDriver: true,
            }).start(() => {
              translateY.setValue(0);
              dismiss();
            });
            return;
          }
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 12,
          }).start();
        },
      }),
    [translateY, windowHeight],
  );

  const openOption = (option: AddMealOption) => {
    requirePremium(option.feature, () => {
      onClose();
      router.push({
        pathname: option.pathname,
        params: { mealDate },
      });
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          style={styles.backdropTap}
          onPress={dismiss}
          accessibilityLabel="Dismiss add meal"
        />
        <Animated.View
          style={[styles.sheet, { paddingBottom, transform: [{ translateY }] }]}
        >
          <View {...panResponder.panHandlers} style={styles.dragZone}>
            <View style={styles.handle} />
            <Text variant="h2" style={styles.title}>
              Add meal
            </Text>
            <Text variant="bodyMuted" style={styles.subtitle}>
              Choose how to log it
            </Text>
          </View>

          <View style={styles.row}>
            {OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                onPress={() => openOption(option)}
                style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
              >
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={22}
                    color={colors.brandPrimary}
                  />
                </View>
                <Text variant="caption" style={styles.tileLabel} numberOfLines={1}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function AddMealOptionsGrid({
  mealDate,
  onBeforeNavigate,
}: {
  mealDate: string;
  onBeforeNavigate?: () => void;
}) {
  const router = useRouter();
  const { requirePremium } = usePremium();

  return (
    <View style={styles.standalone}>
      <Text variant="h2" style={styles.title}>
        Add meal
      </Text>
      <Text variant="bodyMuted" style={styles.subtitle}>
        Choose how to log it
      </Text>
      <View style={styles.row}>
        {OPTIONS.map((option) => (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            onPress={() =>
              requirePremium(option.feature, () => {
                onBeforeNavigate?.();
                router.push({
                  pathname: option.pathname,
                  params: { mealDate },
                });
              })
            }
            style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
          >
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={option.icon} size={22} color={colors.brandPrimary} />
            </View>
            <Text variant="caption" style={styles.tileLabel} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  backdropTap: {
    ...({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const),
  },
  sheet: {
    backgroundColor: colors.surfaceCanvas,
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  dragZone: {
    gap: 4,
    paddingBottom: spacing.xs,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
    minHeight: metrics.touchTargetMin + 28,
  },
  tilePressed: {
    opacity: 0.75,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRose,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tileLabel: {
    textAlign: 'center',
    color: colors.textDark,
  },
  standalone: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
}));
