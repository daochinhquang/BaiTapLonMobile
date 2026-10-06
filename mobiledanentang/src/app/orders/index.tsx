import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import OrderCard from "@/components/OrderCard";
import { Theme } from "@/constants/theme";
import { useShop } from "@/context/ShopContext";
import type { OrderStatus } from "@/types/order";

type OrderFilter = "all" | OrderStatus;

const filters: { label: string; value: OrderFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Đã xác nhận", value: "confirmed" },
  { label: "Đang giao", value: "shipping" },
  { label: "Đã giao", value: "completed" },
  { label: "Đã hủy", value: "cancelled" },
];

export default function OrdersScreen() {
  const { orders, refreshOrders } = useShop();
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");

  useFocusEffect(
    useCallback(() => {
      void refreshOrders();
      const interval = setInterval(() => void refreshOrders(), 15000);

      return () => clearInterval(interval);
    }, [refreshOrders]),
  );

  const filteredOrders = useMemo(
    () =>
      activeFilter === "all"
        ? orders
        : orders.filter((order) => order.status === activeFilter),
    [activeFilter, orders],
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <Header
        showBack
        subtitle="Theo dõi trạng thái mua hàng"
        title="Đơn hàng"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((filter) => {
            const active = filter.value === activeFilter;

            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={filter.value}
                onPress={() => setActiveFilter(filter.value)}
                style={[styles.filterButton, active && styles.activeFilter]}
              >
                <Text
                  style={[styles.filterText, active && styles.activeFilterText]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredOrders.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            text="Các đơn hàng của bạn sẽ xuất hiện tại đây."
            title="Chưa có đơn hàng"
          />
        ) : (
          <View style={styles.list}>
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 100,
  },
  filterRow: {
    gap: Theme.spacing.sm,
    paddingRight: Theme.spacing.lg,
  },
  filterButton: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.md,
  },
  activeFilter: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  filterText: {
    color: Theme.colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  activeFilterText: {
    color: Theme.colors.white,
  },
  list: {
    gap: Theme.spacing.md,
  },
});
