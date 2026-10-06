import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useShop } from '@/context/ShopContext';
import { Theme } from '@/constants/theme';

type HeaderProps = {
  title?: string;
  fallbackHref?: string;
  subtitle?: string;
  showBack?: boolean;
};

export default function Header({
  fallbackHref = '/',
  showBack = false,
  subtitle,
  title = 'ELIP SPORT',
}: HeaderProps) {
  const navigation = useNavigation();
  const { cartCount } = useShop();

  function handleBack() {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref as never);
  }

  return (
    <View style={styles.header}>
      <View style={styles.leftSide}>
        {showBack ? (
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            onPress={handleBack}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <Ionicons color={Theme.colors.text} name="chevron-back" size={24} />
          </Pressable>
        ) : null}

        <View style={styles.titleBlock}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <Pressable
        accessibilityLabel="Mở giỏ hàng"
        accessibilityRole="button"
        onPress={() => router.push('/cart')}
        style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}>
        <Ionicons color={Theme.colors.text} name="cart-outline" size={27} />
        {cartCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  leftSide: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    minWidth: 0,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 25,
  },
  subtitle: {
    color: Theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 2,
  },
  cartButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: 44,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: Theme.colors.accent,
    borderColor: Theme.colors.white,
    borderRadius: 10,
    borderWidth: 2,
    minHeight: 20,
    minWidth: 20,
    paddingHorizontal: 4,
    position: 'absolute',
    right: -7,
    top: -7,
  },
  badgeText: {
    color: Theme.colors.white,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.72,
  },
});
