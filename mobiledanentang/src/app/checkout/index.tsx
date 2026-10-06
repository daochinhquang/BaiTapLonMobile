import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import { formatCurrency, Theme } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';
import { calculateCartSummary, calculateVoucherDiscount, getDefaultVariant } from '@/services/cartService';
import type { CartLine } from '@/types/product';
import type { PaymentMethod, Voucher } from '@/types/user';

const paymentMethods: PaymentMethod[] = ['COD'];

export default function CheckoutScreen() {
  const { productId, quantity, variantId, voucherCode: requestedVoucherCode } = useLocalSearchParams<{
    productId?: string;
    quantity?: string;
    variantId?: string;
    voucherCode?: string;
  }>();
  const {
    getProductById,
    placeOrder,
    refreshVouchers,
    selectedAddress,
    selectedCartLines,
    validateVoucherCode,
    vouchers,
  } = useShop();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | undefined>();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [voucherCode, setVoucherCode] = useState(requestedVoucherCode || '');
  const [voucherError, setVoucherError] = useState('');

  useFocusEffect(useCallback(() => {
    void refreshVouchers().catch(() => {});
  }, [refreshVouchers]));

  const checkoutLines = useMemo<CartLine[]>(() => {
    if (!productId) {
      return selectedCartLines;
    }

    const product = getProductById(productId);

    if (!product) {
      return [];
    }
    const variant = product.variants?.find((item) => item.id === variantId)
      ?? getDefaultVariant(product);

    return [
      {
        product,
        quantity: Math.max(1, Number(quantity ?? 1)),
        selected: true,
        variant,
      },
    ];
  }, [getProductById, productId, quantity, selectedCartLines, variantId]);

  const subtotal = checkoutLines.reduce((total, line) => total + line.variant.price * line.quantity, 0);
  const usableVoucher = appliedVoucher && subtotal >= appliedVoucher.minOrderValue
    ? appliedVoucher
    : undefined;
  const voucherDiscount = calculateVoucherDiscount(usableVoucher, subtotal);
  const summary = calculateCartSummary(checkoutLines, voucherDiscount);
  const isEmpty = checkoutLines.length === 0;
  const voucherMessage = appliedVoucher
    ? usableVoucher
      ? `Đã áp dụng ${appliedVoucher.code}.`
      : `Đơn tối thiểu ${formatCurrency(appliedVoucher.minOrderValue)}.`
    : voucherError;

  async function handleApplyVoucher(requestedCode = voucherCode) {
    const normalizedCode = requestedCode.trim().toUpperCase();
    if (!normalizedCode || validatingVoucher || placingOrder) {
      return;
    }

    setValidatingVoucher(true);
    setVoucherError('');

    try {
      const voucher = await validateVoucherCode(normalizedCode, subtotal);
      setAppliedVoucher(voucher);
      setVoucherCode(voucher.code);
    } catch (error) {
      setAppliedVoucher(undefined);
      setVoucherError(error instanceof Error ? error.message : 'Không thể áp dụng mã giảm giá.');
    } finally {
      setValidatingVoucher(false);
    }
  }

  async function handlePlaceOrder() {
    if (isEmpty || placingOrder || validatingVoucher) {
      return;
    }

    if (!selectedAddress) {
      Alert.alert('Chưa có địa chỉ', 'Vui lòng thêm địa chỉ nhận hàng trước khi đặt hàng.');
      router.push('/address' as never);
      return;
    }

    setPlacingOrder(true);

    try {
      const order = await placeOrder(
        checkoutLines,
        paymentMethod,
        voucherDiscount,
        usableVoucher?.id,
        {
          clearSelectedCart: !productId,
        }
      );
      Alert.alert('Đặt hàng thành công', `Mã đơn của bạn là ${order.code}.`);
      router.replace({ pathname: '/orders/[id]', params: { id: order.id } } as never);
    } catch (error) {
      Alert.alert(
        'Không thể đặt hàng',
        error instanceof Error ? error.message : 'Vui lòng kiểm tra lại giỏ hàng.'
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Header showBack subtitle="Kiểm tra thông tin trước khi đặt" title="Thanh toán" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {isEmpty ? (
          <EmptyState icon="bag-outline" text="Chọn sản phẩm trước khi thanh toán." title="Chưa có sản phẩm" />
        ) : (
          <>
            <Section title="Địa chỉ nhận hàng" action="Thay đổi" onPress={() => router.push('/address' as never)} />
            {selectedAddress ? (
              <View style={styles.addressCard}>
                <Text style={styles.addressName}>
                  {selectedAddress.receiverName} - {selectedAddress.phone}
                </Text>
                <Text style={styles.addressText}>
                  {selectedAddress.detail}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                </Text>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/address' as never)}
                style={({ pressed }) => [styles.missingAddressCard, pressed && styles.pressed]}>
                <Ionicons color={Theme.colors.primary} name="add-circle-outline" size={22} />
                <View style={styles.missingAddressCopy}>
                  <Text style={styles.addressName}>Thêm địa chỉ nhận hàng</Text>
                  <Text style={styles.addressText}>Tài khoản này chưa có địa chỉ mặc định.</Text>
                </View>
              </Pressable>
            )}

            <Section title="Danh sách sản phẩm" action={`${checkoutLines.length} món`} />
            <View style={styles.productList}>
              {checkoutLines.map((line) => (
                <View key={`${line.product.id}-${line.variant.id}`} style={styles.checkoutItem}>
                  <Image source={{ uri: line.product.image }} style={styles.itemImage} />
                  <View style={styles.itemBody}>
                    <Text numberOfLines={1} style={styles.itemName}>
                      {line.product.name}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {[line.variant.size ? `Size ${line.variant.size}` : '', line.variant.color]
                        .filter(Boolean)
                        .join(' · ')}
                      {line.variant.size || line.variant.color ? ' · ' : ''}Số lượng: {line.quantity}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>{formatCurrency(line.variant.price * line.quantity)}</Text>
                </View>
              ))}
            </View>

            <Section title="Voucher" action={usableVoucher ? usableVoucher.code : 'Nhập mã giảm giá'} />
            <View style={styles.voucherInputRow}>
              <TextInput
                accessibilityLabel="Mã voucher"
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!validatingVoucher && !placingOrder}
                maxLength={50}
                onSubmitEditing={() => void handleApplyVoucher()}
                returnKeyType="done"
                onChangeText={(value) => {
                  setVoucherCode(value.toUpperCase());
                  setAppliedVoucher(undefined);
                  setVoucherError('');
                }}
                placeholder="Nhập mã voucher"
                placeholderTextColor={Theme.colors.muted}
                style={styles.voucherInput}
                value={voucherCode}
              />
              {appliedVoucher ? (
                <Pressable
                  accessibilityLabel="Bỏ voucher"
                  accessibilityRole="button"
                  disabled={placingOrder || validatingVoucher}
                  onPress={() => {
                    setAppliedVoucher(undefined);
                    setVoucherCode('');
                    setVoucherError('');
                  }}>
                  <Ionicons color={Theme.colors.muted} name="close-circle-outline" size={24} />
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                disabled={!voucherCode.trim() || validatingVoucher || placingOrder}
                onPress={() => void handleApplyVoucher()}
                style={({ pressed }) => [
                  styles.voucherApplyButton,
                  (!voucherCode.trim() || validatingVoucher) && styles.disabledPlaceButton,
                  pressed && styles.pressed,
                ]}>
                {validatingVoucher ? <ActivityIndicator color={Theme.colors.white} size="small" /> : (
                  <Text style={styles.voucherApplyText}>Áp dụng</Text>
                )}
              </Pressable>
            </View>
            {voucherMessage ? (
              <Text style={[
                styles.voucherMessage,
                !usableVoucher && styles.voucherMessageError,
              ]}>
                {voucherMessage}
              </Text>
            ) : null}
            <View style={styles.optionList}>
              {vouchers.map((voucher) => {
                const enabled = subtotal >= voucher.minOrderValue && (voucher.quantity === undefined || voucher.quantity > 0);
                const selected = voucher.id === usableVoucher?.id && enabled;

                return (
                  <Pressable
                    accessibilityRole="button"
                    disabled={!enabled || validatingVoucher || placingOrder}
                    key={voucher.id}
                    onPress={() => void handleApplyVoucher(voucher.code)}
                    style={[
                      styles.optionCard,
                      selected && styles.selectedOption,
                      !enabled && styles.disabledOption,
                    ]}>
                    <Text style={styles.optionTitle}>{voucher.code}</Text>
                    <Text style={styles.optionText}>{voucher.name}</Text>
                    <Text style={styles.optionText}>
                      {voucher.type === 'phan_tram' ? `Giảm ${voucher.value}%` : `Giảm ${formatCurrency(voucher.value ?? voucher.discount)}`}
                      {voucher.maxDiscount != null ? `, tối đa ${formatCurrency(voucher.maxDiscount)}` : ''}
                      {` · Đơn từ ${formatCurrency(voucher.minOrderValue)}`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Section title="Phương thức thanh toán" />
            <View style={styles.paymentGrid}>
              {paymentMethods.map((method) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: paymentMethod === method }}
                  key={method}
                  onPress={() => setPaymentMethod(method)}
                  style={[
                    styles.paymentButton,
                    paymentMethod === method && styles.selectedPayment,
                  ]}>
                  <Ionicons
                    color={paymentMethod === method ? Theme.colors.primary : Theme.colors.muted}
                    name={method === 'COD' ? 'cash-outline' : 'card-outline'}
                    size={20}
                  />
                  <Text style={styles.paymentText}>
                    {method === 'ChuyenKhoan' ? 'Chuyển khoản' : method}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.summaryCard}>
              <SummaryRow label="Tổng tiền hàng" value={formatCurrency(summary.subtotal)} />
              <SummaryRow label="Giảm giá" value={`-${formatCurrency(summary.discount)}`} />
              <SummaryRow label="Phí vận chuyển" value={summary.shippingFee === 0 ? 'Miễn phí' : formatCurrency(summary.shippingFee)} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                <Text style={styles.totalValue}>{formatCurrency(summary.total)}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {!isEmpty ? (
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            disabled={placingOrder || validatingVoucher}
            onPress={() => void handlePlaceOrder()}
            style={({ pressed }) => [
              styles.placeButton,
              (!selectedAddress || placingOrder) && styles.disabledPlaceButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.placeText}>{placingOrder ? 'Đang đặt hàng...' : 'Đặt hàng'}</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Section({
  action,
  onPress,
  title,
}: {
  action?: string;
  onPress?: () => void;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onPress}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Theme.colors.background,
    flex: 1,
  },
  content: {
    gap: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    paddingBottom: 128,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  sectionAction: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  addressCard: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    padding: Theme.spacing.lg,
  },
  addressName: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  addressText: {
    color: Theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: Theme.spacing.xs,
  },
  missingAddressCard: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primarySoft,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
  },
  missingAddressCopy: {
    flex: 1,
    minWidth: 0,
  },
  productList: {
    gap: Theme.spacing.md,
  },
  checkoutItem: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
  },
  itemImage: {
    borderRadius: Theme.radius.md,
    height: 62,
    width: 62,
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  itemMeta: {
    color: Theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 2,
  },
  itemPrice: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  optionList: {
    gap: Theme.spacing.sm,
  },
  optionCard: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    padding: Theme.spacing.md,
  },
  selectedOption: {
    backgroundColor: Theme.colors.primarySoft,
    borderColor: Theme.colors.primary,
  },
  disabledOption: {
    opacity: 0.45,
  },
  voucherInputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  voucherInput: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    color: Theme.colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: Theme.spacing.md,
  },
  voucherApplyButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Theme.spacing.lg,
    width: 104,
  },
  voucherApplyText: {
    color: Theme.colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  voucherMessage: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
    marginTop: -Theme.spacing.sm,
  },
  voucherMessageError: {
    color: Theme.colors.danger,
  },
  optionTitle: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  optionText: {
    color: Theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 2,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  paymentButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    minHeight: 46,
    paddingHorizontal: Theme.spacing.md,
  },
  selectedPayment: {
    backgroundColor: Theme.colors.primarySoft,
    borderColor: Theme.colors.primary,
  },
  paymentText: {
    color: Theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  summaryCard: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: Theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  summaryValue: {
    color: Theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  totalRow: {
    borderTopColor: Theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Theme.spacing.md,
  },
  totalLabel: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  totalValue: {
    color: Theme.colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  footer: {
    backgroundColor: Theme.colors.surface,
    borderTopColor: Theme.colors.border,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: Theme.spacing.lg,
    position: 'absolute',
    right: 0,
  },
  placeButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    minHeight: 54,
  },
  disabledPlaceButton: {
    opacity: 0.62,
  },
  placeText: {
    color: Theme.colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.72,
  },
});
