import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, router, useSegments } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme';
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
  const bottomInset = Math.max(insets.bottom, 6);
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
              borderTopColor: colors.borderLight,
              height: 58 + bottomInset,
              paddingTop: 6,
              paddingBottom: bottomInset,
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
