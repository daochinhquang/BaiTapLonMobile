import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import { Theme } from "@/constants/theme";
import { useShop } from "@/context/ShopContext";
import type { Product } from "@/types/product";

export default function CategoryProductsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, getCategoryById, products, refreshProducts } = useShop();
  const category = id === "all" ? null : getCategoryById(id);
  const filteredProducts =
    id === "all"
      ? products
      : products.filter((product) => product.category === id);

  useFocusEffect(
    useCallback(() => {
      void refreshProducts();
      const interval = setInterval(() => void refreshProducts(), 15000);

      return () => clearInterval(interval);
    }, [refreshProducts]),
  );

  function handleAdd(product: Product) {
    addToCart(product.id);
    Alert.alert(
      "Đã thêm vào giỏ hàng",
      `${product.name} đã được thêm vào giỏ.`,
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <Header
        showBack
        subtitle={`${filteredProducts.length} sản phẩm`}
        title={category?.name ?? "Tất cả sản phẩm"}
      />
      <View style={styles.searchWrap}>
        <SearchBar />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.description}>
          {category?.description ??
            "Danh sách sản phẩm bóng chuyền, giày, quần áo và phụ kiện đang có."}
        </Text>
        {filteredProducts.length === 0 ? (
          <EmptyState
            text="Danh mục này chưa có sản phẩm mẫu."
            title="Chưa có sản phẩm"
          />
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                onAdd={handleAdd}
                product={product}
                style={styles.productCard}
              />
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
  searchWrap: {
    paddingHorizontal: Theme.spacing.lg,
  },
  content: {
    gap: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  description: {
    color: Theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.md,
  },
  productCard: {
    width: "48%",
  },
});
