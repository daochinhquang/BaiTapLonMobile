import '@/global.css';

import { Platform } from 'react-native';

export const Theme = {
  colors: {
    background: '#F6F8F7',
    surface: '#FFFFFF',
    surfaceMuted: '#F1F5F3',
    text: '#101314',
    muted: '#687076',
    border: '#E1E7E4',
    primary: '#00A36C',
    primaryDark: '#007F55',
    primarySoft: '#E7F8F0',
    accent: '#FF6B35',
    accentSoft: '#FFF0EA',
    warning: '#F8B400',
    danger: '#E53935',
    success: '#10B981',
    white: '#FFFFFF',
    black: '#101314',
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 8,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  shadow: {
    elevation: 3,
    shadowColor: '#101314',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
} as const;

export const Layout = {
  maxWidth: 480,
  horizontalPadding: 16,
  bottomTabHeight: Platform.select({ ios: 86, android: 78, web: 76 }) ?? 78,
} as const;

export const Colors = {
  light: {
    text: Theme.colors.text,
    background: Theme.colors.background,
    backgroundElement: Theme.colors.surface,
    backgroundSelected: Theme.colors.primarySoft,
    textSecondary: Theme.colors.muted,
  },
  dark: {
    text: '#F4F7F5',
    background: '#101513',
    backgroundElement: '#18201C',
    backgroundSelected: '#163B2A',
    textSecondary: '#A6B1AC',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Layout.bottomTabHeight;
export const MaxContentWidth = 800;

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    currency: 'VND',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
