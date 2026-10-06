import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Theme } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';
import type { Product } from '@/types/product';

export default function FavoritesScreen() {
  const { addToCart, favoriteProducts } = useShop();

  function handleAdd(product: Product) {
    addToCart(product.id);
    Alert.alert('Đã thêm vào giỏ hàng', `${product.name} đã được thêm vào giỏ.`);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Header subtitle="Những sản phẩm bạn đã lưu" title="Yêu thích" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {favoriteProducts.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            text="Nhấn biểu tượng trái tim trên sản phẩm để lưu lại."
            title="Chưa có sản phẩm yêu thích"
          />
        ) : (
          <View style={styles.grid}>
            {favoriteProducts.map((product) => (
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
  content: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  productCard: {
    width: '48%',
  },
});
