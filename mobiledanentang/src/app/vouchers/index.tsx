import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import { formatCurrency, Theme } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';

export default function VouchersScreen() {
  const { refreshVouchers, selectedCartLines, vouchers } = useShop();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    void refreshVouchers()
      .then(() => { if (active) setError(''); })
      .catch(() => { if (active) setError('Không thể tải voucher.'); });
    return () => { active = false; };
  }, [refreshVouchers]));

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshVouchers();
      setError('');
    } catch {
      setError('Không thể tải voucher.');
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Header showBack title="Kho voucher" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl onRefresh={() => void handleRefresh()} refreshing={refreshing} />}
        showsVerticalScrollIndicator={false}>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {!vouchers.length ? (
          <EmptyState icon="ticket-outline" text="Hiện chưa có mã giảm giá khả dụng." title="Chưa có voucher" />
        ) : vouchers.map((voucher) => (
          <View key={voucher.id} style={styles.voucher}>
            <View style={styles.heading}>
              <Ionicons color={Theme.colors.primary} name="ticket-outline" size={24} />
              <Text selectable style={styles.code}>{voucher.code}</Text>
            </View>
            <Text style={styles.discount}>
              {voucher.type === 'phan_tram'
                ? `Giảm ${voucher.value}%`
                : `Giảm ${formatCurrency(voucher.value ?? voucher.discount)}`}
            </Text>
            <Text style={styles.name}>{voucher.name}</Text>
            <Text style={styles.detail}>Đơn từ {formatCurrency(voucher.minOrderValue)}</Text>
            {voucher.maxDiscount != null ? (
              <Text style={styles.detail}>Giảm tối đa {formatCurrency(voucher.maxDiscount)}</Text>
            ) : null}
            {voucher.endsAt ? (
              <Text style={styles.detail}>Hết hạn: {new Date(voucher.endsAt).toLocaleString('vi-VN')}</Text>
            ) : null}
            {voucher.quantity !== undefined ? <Text style={styles.detail}>Còn {voucher.quantity} lượt</Text> : null}
            {selectedCartLines.length ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/checkout', params: { voucherCode: voucher.code } } as never)}
                style={({ pressed }) => [styles.useButton, pressed && styles.pressed]}>
                <Text style={styles.useText}>Chọn mã</Text>
                <Ionicons color={Theme.colors.primary} name="arrow-forward" size={18} />
              </Pressable>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Theme.colors.background, flex: 1 },
  content: { gap: Theme.spacing.md, padding: Theme.spacing.lg, paddingBottom: 60 },
  voucher: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: Theme.spacing.xs,
    padding: Theme.spacing.lg,
  },
  heading: { alignItems: 'center', flexDirection: 'row', gap: Theme.spacing.sm },
  code: { color: Theme.colors.text, flex: 1, fontSize: 16, fontWeight: '800' },
  discount: { color: Theme.colors.primary, fontSize: 20, fontWeight: '900', marginTop: Theme.spacing.sm },
  name: { color: Theme.colors.text, fontSize: 14, fontWeight: '700' },
  detail: { color: Theme.colors.muted, fontSize: 13, lineHeight: 20 },
  error: { color: Theme.colors.danger, fontSize: 13 },
  useButton: {
    alignItems: 'center', alignSelf: 'flex-end', flexDirection: 'row', gap: Theme.spacing.sm,
    minHeight: 44, paddingHorizontal: Theme.spacing.md,
  },
  useText: { color: Theme.colors.primary, fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
