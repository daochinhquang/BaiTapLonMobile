import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CategoryCard from "@/components/CategoryCard";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { Theme } from "@/constants/theme";
import { useShop } from "@/context/ShopContext";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function CategoriesScreen() {
  const { categories, products, refreshProducts } = useShop();

  useFocusEffect(
    useCallback(() => {
      void refreshProducts();
      const interval = setInterval(() => void refreshProducts(), 15000);

      return () => clearInterval(interval);
    }, [refreshProducts]),
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <Header subtitle="Chọn nhanh theo nhu cầu chơi bóng" title="Danh mục" />
      <View style={styles.searchWrap}>
        <SearchBar />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.grid}>
          {categories.map((category) => (
            <CategoryCard category={category} key={category.id} />
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tổng quan cửa hàng</Text>
          <Text style={styles.summaryText}>
            {products.length} sản phẩm mẫu thuộc {categories.length} danh mục,
            gồm bóng thi đấu, bóng tập luyện, giày, quần áo và phụ kiện.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Theme.colors.background,
    flex: 1,
  },
  searchWrap: {
    paddingHorizontal: Theme.spacing.lg,
  },
  content: {
    gap: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.md,
  },
  summaryCard: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    padding: Theme.spacing.lg,
  },
  summaryTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
  },
  summaryText: {
    color: Theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: Theme.spacing.xs,
  },
});
