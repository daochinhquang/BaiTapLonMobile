import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CartItem from '@/components/CartItem';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import { formatCurrency, Theme } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';

export default function CartScreen() {
  const {
    cartLines,
    removeCartItem,
    selectedCartLines,
    selectedCartSummary,
    toggleCartItemSelected,
    updateCartQuantity,
  } = useShop();
  const isEmpty = cartLines.length === 0;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Header showBack subtitle={`${cartLines.length} dòng sản phẩm`} title="Giỏ hàng" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {isEmpty ? (
          <EmptyState
            icon="cart-outline"
            text="Thêm sản phẩm từ trang chủ để bắt đầu mua hàng."
            title="Giỏ hàng đang trống"
          />
        ) : (
          <View style={styles.list}>
            {cartLines.map((line) => (
              <CartItem
                key={`${line.product.id}-${line.variant.id}`}
                line={line}
                onRemove={() => removeCartItem(line.product.id, line.variant.id)}
                onSelect={() => toggleCartItemSelected(line.product.id, line.variant.id)}
                onUpdateQuantity={(quantity) => updateCartQuantity(line.product.id, line.variant.id, quantity)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalBlock}>
          <Text style={styles.totalLabel}>Tổng tiền</Text>
          <Text style={styles.totalValue}>{formatCurrency(selectedCartSummary.total)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={selectedCartLines.length === 0}
          onPress={() => router.push('/checkout')}
          style={({ pressed }) => [
            styles.checkoutButton,
            selectedCartLines.length === 0 && styles.disabledButton,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.checkoutText}>Mua hàng</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Theme.colors.background,
    flex: 1,
  },
  content: {
    padding: Theme.spacing.lg,
    paddingBottom: 120,
  },
  list: {
    gap: Theme.spacing.md,
  },
  footer: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderTopColor: Theme.colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: Theme.spacing.md,
    left: 0,
    padding: Theme.spacing.lg,
    position: 'absolute',
    right: 0,
  },
  totalBlock: {
    flex: 1,
    minWidth: 0,
  },
  totalLabel: {
    color: Theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  totalValue: {
    color: Theme.colors.text,
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 27,
  },
  checkoutButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 128,
    paddingHorizontal: Theme.spacing.lg,
  },
  disabledButton: {
    backgroundColor: Theme.colors.border,
  },
  checkoutText: {
    color: Theme.colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.72,
  },
});
