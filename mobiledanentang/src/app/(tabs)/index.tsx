import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Banner from "@/components/Banner";
import CategoryCard from "@/components/CategoryCard";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import { Theme } from "@/constants/theme";
import { useShop } from "@/context/ShopContext";
import type { Product } from "@/types/product";

const INITIAL_PRODUCTS_PER_GROUP = 4;
const PRODUCTS_PER_LOAD = 4;

type HomeProductGroup = {
  key: string;
  products: Product[];
  title: string;
};

export default function HomeScreen() {
  const { addToCart, categories, products, refreshProducts } = useShop();
  const [loading, setLoading] = useState(true);
  const [visibleProductCounts, setVisibleProductCounts] = useState<
    Record<string, number>
  >({});
  const productGroups = useMemo<HomeProductGroup[]>(() => {
    const categoryNames = new Map(
      categories.map((category) => [category.id, category.name]),
    );
    const groups = new Map<string, HomeProductGroup>();

    products
      .filter((product) => product.featured)
      .forEach((product) => {
        const key = product.typeId
          ? `type-${product.typeId}`
          : `category-${product.category}`;
        const title =
          product.typeName ??
          product.categoryName ??
          categoryNames.get(product.category) ??
          "Sản phẩm";
        const currentGroup = groups.get(key);

        if (currentGroup) {
          currentGroup.products.push(product);
        } else {
          groups.set(key, { key, products: [product], title });
        }
      });

    return Array.from(groups.values());
  }, [categories, products]);

  useFocusEffect(
    useCallback(() => {
      void refreshProducts();
      const interval = setInterval(() => void refreshProducts(), 15000);

      return () => clearInterval(interval);
    }, [refreshProducts]),
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);

    return () => clearTimeout(timer);
  }, []);

  function handleAddToCart(product: Product) {
    addToCart(product.id);
    Alert.alert(
      "Đã thêm vào giỏ hàng",
      `${product.name} đã được thêm vào giỏ.`,
    );
  }

  function handleToggleProducts(groupKey: string, productCount: number) {
    setVisibleProductCounts((current) => {
      const visibleCount = current[groupKey] ?? INITIAL_PRODUCTS_PER_GROUP;

      return {
        ...current,
        [groupKey]:
          visibleCount >= productCount
            ? INITIAL_PRODUCTS_PER_GROUP
            : Math.min(visibleCount + PRODUCTS_PER_LOAD, productCount),
      };
    });
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <Header subtitle="Bóng chuyền chính hãng cho mọi đội bóng" />
      <View style={styles.searchWrap}>
        <SearchBar />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Banner image={categories[0].image} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <Text style={styles.sectionAction}>{categories.length} nhóm</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((category) => (
            <CategoryCard compact category={category} key={category.id} />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sản phẩm theo loại</Text>
          <Text style={styles.sectionAction}>{productGroups.length} loại</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Theme.colors.primary} />
            <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
          </View>
        ) : (
          <View style={styles.productSections}>
            {productGroups.map((group) => {
              const visibleCount =
                visibleProductCounts[group.key] ?? INITIAL_PRODUCTS_PER_GROUP;
              const visibleProducts = group.products.slice(0, visibleCount);
              const canToggle =
                group.products.length > INITIAL_PRODUCTS_PER_GROUP;
              const isFullyExpanded =
                visibleProducts.length >= group.products.length;

              return (
                <View key={group.key} style={styles.productSection}>
                  <View style={styles.productSectionHeader}>
                    <View style={styles.productSectionCopy}>
                      <Text style={styles.productSectionTitle}>{group.title}</Text>
                      <Text style={styles.productCount}>
                        {group.products.length} sản phẩm
                      </Text>
                    </View>

                    {canToggle ? (
                      <Pressable
                        accessibilityLabel={
                          isFullyExpanded
                            ? `Thu gọn ${group.title}`
                            : `Xem thêm ${group.title}`
                        }
                        accessibilityRole="button"
                        onPress={() =>
                          handleToggleProducts(group.key, group.products.length)
                        }
                        style={({ pressed }) => [
                          styles.viewMoreButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={styles.viewMoreText}>
                          {isFullyExpanded ? "Thu gọn" : "Xem thêm"}
                        </Text>
                        <Ionicons
                          color={Theme.colors.primary}
                          name={
                            isFullyExpanded ? "chevron-up" : "chevron-down"
                          }
                          size={16}
                        />
                      </Pressable>
                    ) : null}
                  </View>

                  <View style={styles.productGrid}>
                    {visibleProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        onAdd={handleAddToCart}
                        product={product}
                        style={styles.productCard}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
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
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: Theme.colors.text,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 27,
  },
  sectionAction: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18,
  },
  categoryRow: {
    gap: Theme.spacing.lg,
    paddingRight: Theme.spacing.lg,
  },
  loadingBox: {
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    gap: Theme.spacing.sm,
    justifyContent: "center",
    minHeight: 160,
  },
  loadingText: {
    color: Theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  productSections: {
    gap: Theme.spacing.xl,
  },
  productSection: {
    gap: Theme.spacing.md,
  },
  productSectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productSectionCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  productSectionTitle: {
    color: Theme.colors.text,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  productCount: {
    color: Theme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  viewMoreButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: Theme.spacing.xs,
    minHeight: 36,
    paddingLeft: Theme.spacing.md,
  },
  viewMoreText: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.md,
  },
  productCard: {
    width: "48%",
  },
  pressed: {
    opacity: 0.72,
  },
});
