import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Theme } from '@/constants/theme';
import { ShopProvider } from '@/context/ShopContext';

export default function RootLayout() {
  return (
    <ShopProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: Theme.colors.background },
          headerShown: false,
        }}
      />
    </ShopProvider>
  );
}
