import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCurrency, Theme } from '@/constants/theme';
import { orderStatusLabels } from '@/services/orderService';
import type { Order } from '@/types/order';

type OrderCardProps = {
  order: Order;
};

const fallbackOrderImage =
  'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

export default function OrderCard({ order }: OrderCardProps) {
  const firstItem = order.items[0];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/orders/[id]', params: { id: order.id } } as never)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Image source={{ uri: firstItem?.product.image ?? fallbackOrderImage }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.code}>{order.code}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{orderStatusLabels[order.status]}</Text>
          </View>
        </View>
        <Text numberOfLines={1} style={styles.name}>
          {firstItem?.product.name ?? 'Đơn hàng'}
          {order.items.length > 1 ? ` +${order.items.length - 1} sản phẩm` : ''}
        </Text>
        <Text style={styles.date}>{new Date(order.date).toLocaleDateString('vi-VN')}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.total}>{formatCurrency(order.total)}</Text>
          <Ionicons color={Theme.colors.muted} name="chevron-forward" size={19} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
  },
  image: {
    backgroundColor: Theme.colors.surfaceMuted,
    borderRadius: Theme.radius.md,
    height: 76,
    width: 76,
  },
  body: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  code: {
    color: Theme.colors.muted,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  statusBadge: {
    backgroundColor: Theme.colors.primarySoft,
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    color: Theme.colors.primaryDark,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
  },
  name: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  date: {
    color: Theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  total: {
    color: Theme.colors.primary,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.72,
  },
});
