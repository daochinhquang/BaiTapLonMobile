import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import { Theme } from "@/constants/theme";
import { useShop } from "@/context/ShopContext";
import type { Product } from "@/types/product";

type SortMode = "default" | "price_asc" | "price_desc";

const priceRanges = [
  { label: "Tất cả giá", max: "", min: "" },
  { label: "< 500K", max: "500000", min: "" },
  { label: "500K-1.5M", max: "1500000", min: "500000" },
  { label: "> 1.5M", max: "", min: "1500000" },
];

export default function SearchScreen() {
  const { addToCart, categories, products, refreshProducts } = useShop();
  const [categoryId, setCategoryId] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");

  useFocusEffect(
    useCallback(() => {
      void refreshProducts();
      const interval = setInterval(() => void refreshProducts(), 15000);

      return () => clearInterval(interval);
    }, [refreshProducts]),
  );
  const results = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const min = Number(minPrice || 0);
    const max = Number(maxPrice || Number.MAX_SAFE_INTEGER);

    const filteredProducts = products.filter((product) => {
      const matchedKeyword =
        !normalizedKeyword ||
        [
          product.name,
          product.brand,
          product.description,
          product.typeName,
          product.categoryName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);
      const matchedCategory =
        categoryId === "all" || product.category === categoryId;
      const matchedPrice = product.price >= min && product.price <= max;

      return matchedKeyword && matchedCategory && matchedPrice;
    });

    if (sortMode === "price_asc") {
      return [...filteredProducts].sort((a, b) => a.price - b.price);
    }

    if (sortMode === "price_desc") {
      return [...filteredProducts].sort((a, b) => b.price - a.price);
    }

    return filteredProducts;
  }, [categoryId, keyword, maxPrice, minPrice, products, sortMode]);

  function handleAdd(product: Product) {
    addToCart(product.id);
    Alert.alert(
      "Đã thêm vào giỏ hàng",
      `${product.name} đã được thêm vào giỏ.`,
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <Header showBack title="Tìm kiếm" />
      <View style={styles.searchWrap}>
        <SearchBar
          autoFocus
          navigateOnFocus={false}
          onChangeText={setKeyword}
          value={keyword}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.filterPanel}>
          <Text style={styles.filterTitle}>Danh mục</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {[{ id: "all", name: "Tất cả" }, ...categories].map((category) => {
              const active = category.id === categoryId;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={category.id}
                  onPress={() => setCategoryId(category.id)}
                  style={[styles.chip, active && styles.activeChip]}
                >
                  <Text
                    style={[styles.chipText, active && styles.activeChipText]}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.filterTitle}>Khoảng giá</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {priceRanges.map((range) => {
              const active = range.min === minPrice && range.max === maxPrice;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={range.label}
                  onPress={() => {
                    setMinPrice(range.min);
                    setMaxPrice(range.max);
                  }}
                  style={[styles.chip, active && styles.activeChip]}
                >
                  <Text
                    style={[styles.chipText, active && styles.activeChipText]}
                  >
                    {range.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.priceInputRow}>
            <TextInput
              keyboardType="numeric"
              onChangeText={setMinPrice}
              placeholder="Giá từ"
              placeholderTextColor={Theme.colors.muted}
              style={styles.priceInput}
              value={minPrice}
            />
            <TextInput
              keyboardType="numeric"
              onChangeText={setMaxPrice}
              placeholder="Giá đến"
              placeholderTextColor={Theme.colors.muted}
              style={styles.priceInput}
              value={maxPrice}
            />
          </View>

          <View style={styles.sortRow}>
            {[
              { label: "Mặc định", value: "default" },
              { label: "Giá tăng", value: "price_asc" },
              { label: "Giá giảm", value: "price_desc" },
            ].map((item) => {
              const active = sortMode === item.value;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={item.value}
                  onPress={() => setSortMode(item.value as SortMode)}
                  style={[styles.sortButton, active && styles.activeSortButton]}
                >
                  <Text
                    style={[styles.sortText, active && styles.activeSortText]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={styles.resultText}>{results.length} sản phẩm phù hợp</Text>
        {results.length === 0 ? (
          <EmptyState
            icon="search-outline"
            text="Thử tìm theo tên sản phẩm, thương hiệu hoặc loại phụ kiện."
            title="Không tìm thấy sản phẩm"
          />
        ) : (
          <View style={styles.grid}>
            {results.map((product) => (
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
  resultText: {
    color: Theme.colors.muted,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  filterPanel: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  filterTitle: {
    color: Theme.colors.text,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18,
  },
  chipRow: {
    gap: Theme.spacing.sm,
    paddingRight: Theme.spacing.lg,
  },
  chip: {
    backgroundColor: Theme.colors.surfaceMuted,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: Theme.spacing.md,
  },
  activeChip: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  chipText: {
    color: Theme.colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  activeChipText: {
    color: Theme.colors.white,
  },
  priceInputRow: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
  },
  priceInput: {
    backgroundColor: Theme.colors.surfaceMuted,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    color: Theme.colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    minHeight: 42,
    paddingHorizontal: Theme.spacing.md,
  },
  sortRow: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
  },
  sortButton: {
    alignItems: "center",
    backgroundColor: Theme.colors.surfaceMuted,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 38,
  },
  activeSortButton: {
    backgroundColor: Theme.colors.primarySoft,
    borderColor: Theme.colors.primary,
  },
  sortText: {
    color: Theme.colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  activeSortText: {
    color: Theme.colors.primary,
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
