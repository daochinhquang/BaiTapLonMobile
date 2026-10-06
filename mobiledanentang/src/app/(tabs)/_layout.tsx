import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { Theme } from '@/constants/theme';
import type { IoniconName } from '@/types/product';

type TabIconProps = {
  color: ColorValue;
  focused: boolean;
  name: IoniconName;
  selectedName: IoniconName;
};

function TabIcon({ color, focused, name, selectedName }: TabIconProps) {
  return <Ionicons color={String(color)} name={focused ? selectedName : name} size={24} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
        },
        tabBarStyle: {
          backgroundColor: Theme.colors.surface,
          borderTopColor: Theme.colors.border,
          height: 76,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="home-outline" selectedName="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Danh mục',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="grid-outline" selectedName="grid" />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Yêu thích',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="heart-outline" selectedName="heart" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="person-outline" selectedName="person" />
          ),
        }}
      />
    </Tabs>
  );
}
