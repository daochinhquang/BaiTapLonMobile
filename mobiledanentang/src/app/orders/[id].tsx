import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";

import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import { formatCurrency, Theme } from "@/constants/theme";
import { useShop } from "@/context/ShopContext";
import {
  orderStatusLabels,
  orderTimeline,
  paymentMethodLabels,
  paymentStatusLabels,
} from "@/services/orderService";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cancelOrder, orders, refreshOrders } = useShop();
  const [cancelling, setCancelling] = useState(false);
  const cancellationInFlight = useRef(false);
  const order = orders.find((entry) => entry.id === id);

  useFocusEffect(
    useCallback(() => {
      void refreshOrders();
      const interval = setInterval(() => void refreshOrders(), 15000);

      return () => clearInterval(interval);
    }, [refreshOrders]),
  );

  if (!order) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <Header showBack title="Chi tiết đơn hàng" />
        <View style={styles.emptyWrap}>
          <EmptyState
            text="Đơn hàng không có trong tài khoản của bạn."
            title="Không tìm thấy đơn"
          />
        </View>
      </SafeAreaView>
    );
  }

  const currentOrder = order;
  const activeIndex = orderTimeline.indexOf(currentOrder.status);
  const canCancel =
    currentOrder.status === "pending" || currentOrder.status === "confirmed";

  async function handleCancelOrder() {
    if (cancellationInFlight.current || !canCancel) return;
    cancellationInFlight.current = true;
    setCancelling(true);

    try {
      await cancelOrder(currentOrder.id);
      showMessage(
        "Đã hủy đơn",
        "Đơn hàng đã được hủy và tồn kho đã được hoàn lại.",
      );
    } catch (error) {
      showMessage(
        "Không thể hủy đơn",
        error instanceof Error
          ? error.message
          : "Đơn hàng không còn được phép hủy.",
      );
    } finally {
      cancellationInFlight.current = false;
      setCancelling(false);
    }
  }

  function confirmCancellation() {
    if (cancellationInFlight.current || !canCancel) return;
    if (Platform.OS === "web") {
      if (window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) {
        void handleCancelOrder();
      }
      return;
    }
    Alert.alert("Hủy đơn", "Bạn chắc chắn muốn hủy đơn hàng này?", [
      { style: "cancel", text: "Không" },
      {
        onPress: () => void handleCancelOrder(),
        style: "destructive",
        text: "Hủy đơn",
      },
    ]);
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <Header showBack subtitle={order.code} title="Chi tiết đơn hàng" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>
            {orderStatusLabels[order.status]}
          </Text>
          <Text style={styles.statusText}>
            Đặt ngày {new Date(order.date).toLocaleDateString("vi-VN")}
          </Text>
        </View>

        <View style={styles.timelineCard}>
          {orderTimeline.map((status, index) => {
            const completed =
              order.status === "completed" ||
              (activeIndex >= 0 && index <= activeIndex);

            return (
              <View key={status} style={styles.timelineRow}>
                <View
                  style={[
                    styles.timelineDot,
                    completed && styles.timelineDotDone,
                  ]}
                >
                  <Ionicons
                    color={Theme.colors.white}
                    name="checkmark"
                    size={14}
                  />
                </View>
                <Text
                  style={[
                    styles.timelineText,
                    completed && styles.timelineTextDone,
                  ]}
                >
                  {orderStatusLabels[status]}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Địa chỉ nhận hàng</Text>
          <Text style={styles.cardText}>
            {order.address.receiverName} - {order.address.phone}
          </Text>
          <Text style={styles.cardMuted}>
            {order.address.detail}, {order.address.ward},{" "}
            {order.address.district}, {order.address.province}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sản phẩm</Text>
          {order.items.map((item) => (
            <View
              key={`${item.product.id}-${item.variant?.id || "default"}`}
              style={styles.productRow}
            >
              <Image
                source={{ uri: item.product.image }}
                style={styles.productImage}
              />
              <View style={styles.productCopy}>
                <Text numberOfLines={1} style={styles.productName}>
                  {item.product.name}
                </Text>
                <Text style={styles.productMeta}>
                  {[
                    item.variant?.size ? `Size ${item.variant.size}` : "",
                    item.variant?.color || "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  {item.variant?.size || item.variant?.color ? " · " : ""}Số
                  lượng {item.quantity}
                </Text>
              </View>
              <Text style={styles.productPrice}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thanh toán</Text>
          <InfoRow
            label="Tổng tiền hàng"
            value={formatCurrency(order.subtotal)}
          />
          <InfoRow
            label="Giảm giá"
            value={`-${formatCurrency(order.discount)}`}
          />
          <InfoRow
            label="Phí vận chuyển"
            value={
              order.shippingFee === 0
                ? "Miễn phí"
                : formatCurrency(order.shippingFee)
            }
          />
          <InfoRow
            label="Phương thức"
            value={paymentMethodLabels[order.paymentMethod]}
          />
          <InfoRow
            label="Trạng thái"
            value={paymentStatusLabels[order.paymentStatus]}
          />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {canCancel ? (
          <Pressable
            accessibilityRole="button"
            disabled={cancelling}
            onPress={confirmCancellation}
            style={({ pressed }) => [
              styles.cancelButton,
              cancelling && styles.disabledButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.cancelText}>
              {cancelling ? "Đang hủy..." : "Hủy đơn"}
            </Text>
          </Pressable>
        ) : null}

        {order.status === "completed" ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              Alert.alert("Đánh giá sản phẩm", "Cảm ơn bạn đã mua hàng.")
            }
            style={({ pressed }) => [
              styles.reviewButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.reviewText}>Đánh giá sản phẩm</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function showMessage(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Theme.colors.background,
    flex: 1,
  },
  emptyWrap: {
    padding: Theme.spacing.lg,
  },
  content: {
    gap: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  statusCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.lg,
  },
  statusTitle: {
    color: Theme.colors.white,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
  },
  statusText: {
    color: "#EAFBF2",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: Theme.spacing.xs,
  },
  timelineCard: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
  },
  timelineRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  timelineDot: {
    alignItems: "center",
    backgroundColor: Theme.colors.border,
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  timelineDotDone: {
    backgroundColor: Theme.colors.primary,
  },
  timelineText: {
    color: Theme.colors.muted,
    fontSize: 14,
    fontWeight: "800",
  },
  timelineTextDone: {
    color: Theme.colors.text,
    fontWeight: "900",
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    gap: Theme.spacing.sm,
    padding: Theme.spacing.lg,
  },
  cardTitle: {
    color: Theme.colors.text,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  cardText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19,
  },
  cardMuted: {
    color: Theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  productRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  productImage: {
    borderRadius: Theme.radius.md,
    height: 58,
    width: 58,
  },
  productCopy: {
    flex: 1,
    minWidth: 0,
  },
  productName: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18,
  },
  productMeta: {
    color: Theme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 2,
  },
  productPrice: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    color: Theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  infoValue: {
    color: Theme.colors.text,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
  },
  totalRow: {
    borderTopColor: Theme.colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: Theme.spacing.md,
  },
  totalLabel: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  totalValue: {
    color: Theme.colors.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  cancelButton: {
    alignItems: "center",
    borderColor: Theme.colors.danger,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
  },
  disabledButton: {
    opacity: 0.62,
  },
  cancelText: {
    color: Theme.colors.danger,
    fontSize: 15,
    fontWeight: "900",
  },
  reviewButton: {
    alignItems: "center",
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    justifyContent: "center",
    minHeight: 52,
  },
  reviewText: {
    color: Theme.colors.white,
    fontSize: 15,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.72,
  },
});
