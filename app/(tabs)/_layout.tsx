import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, router, useSegments } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows } from '@/theme';
import { fontFamily } from '@/theme/typography';

type TabIconName = 'dumbbell' | 'food-apple' | 'chart-line' | 'cog';

function TabIcon({
  name,
  color,
  focused,
}: {
  name: TabIconName;
  color: ColorValue;
  focused: boolean;
}) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={focused ? 24 : 22}
      color={color}
    />
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const tabBarBottomPadding = Math.max(insets.bottom - 10, 6);
  const hideTabBar = segments.length > 2;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: hideTabBar
          ? { display: 'none' }
          : {
              backgroundColor: colors.surfaceCanvas,
              borderTopWidth: 0,
              height: 58 + tabBarBottomPadding,
              paddingTop: 6,
              paddingBottom: tabBarBottomPadding,
              paddingHorizontal: 8,
              ...shadows.card,
            },
        tabBarActiveBackgroundColor: colors.surfaceRose,
        tabBarItemStyle: {
          minHeight: 42,
          justifyContent: 'center',
          borderRadius: radius.card,
          marginHorizontal: 4,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.medium,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="dumbbell" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        listeners={{
          tabPress: () => {
            router.replace('/(tabs)/nutrition');
          },
        }}
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="food-apple" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        listeners={{
          tabPress: () => {
            router.navigate('/(tabs)/progress');
          },
        }}
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chart-line" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="cog" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
