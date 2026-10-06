import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { formatCurrency, Theme } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';
import type { Product } from '@/types/product';

type ProductCardProps = {
  onAdd?: (product: Product) => void;
  product: Product;
  style?: StyleProp<ViewStyle>;
};

export default function ProductCard({ onAdd, product, style }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useShop();
  const liked = isFavorite(product.id);
  const isOutOfStock = product.stock <= 0;

  function openProductDetail() {
    router.push({ pathname: '/product/[id]', params: { id: product.id } } as never);
  }

  return (
    <View style={[styles.card, style]}>
      <View style={styles.imageWrap}>
        <Pressable
          accessibilityLabel={`Xem chi tiết ${product.name}`}
          accessibilityRole="button"
          onPress={openProductDetail}
          style={({ pressed }) => [styles.imageButton, pressed && styles.pressed]}>
          <Image source={{ uri: product.image }} style={styles.image} />
        </Pressable>
        <Pressable
          accessibilityLabel="Yêu thích"
          accessibilityRole="button"
          onPress={() => toggleFavorite(product.id)}
          style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed]}>
          <Ionicons
            color={liked ? Theme.colors.accent : Theme.colors.text}
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Pressable
          accessibilityLabel={`Xem chi tiết ${product.name}`}
          accessibilityRole="button"
          onPress={openProductDetail}
          style={({ pressed }) => [styles.detailButton, pressed && styles.pressed]}>
          <Text numberOfLines={2} style={styles.name}>
            {product.name}
          </Text>
          <Text numberOfLines={1} style={styles.brand}>
            {product.brand}
          </Text>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          <Text style={[styles.stockText, isOutOfStock && styles.outOfStockText]}>
            {isOutOfStock ? 'Hết hàng' : `Còn ${product.stock}`}
          </Text>
        </Pressable>
        <View style={styles.metaRow}>
          <Pressable
            accessibilityLabel={`Xem đánh giá ${product.name}`}
            accessibilityRole="button"
            onPress={openProductDetail}
            style={({ pressed }) => [styles.ratingRow, pressed && styles.pressed]}>
            <Ionicons color={Theme.colors.warning} name="star" size={14} />
            <Text style={styles.ratingText}>
              {product.rating} ({product.reviewCount})
            </Text>
          </Pressable>
          {onAdd ? (
            <Pressable
              accessibilityLabel="Thêm vào giỏ"
              accessibilityRole="button"
              disabled={isOutOfStock}
              onPress={() => onAdd(product)}
              style={({ pressed }) => [
                styles.addButton,
                isOutOfStock && styles.disabledAddButton,
                pressed && styles.pressed,
              ]}>
              <Ionicons color={Theme.colors.white} name="add" size={18} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flexGrow: 1,
    overflow: 'hidden',
  },
  imageWrap: {
    backgroundColor: Theme.colors.surfaceMuted,
    height: 150,
    position: 'relative',
  },
  imageButton: {
    height: '100%',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  favoriteButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: Theme.spacing.sm,
    top: Theme.spacing.sm,
    width: 34,
  },
  body: {
    gap: Theme.spacing.xs,
    padding: Theme.spacing.md,
  },
  detailButton: {
    gap: Theme.spacing.xs,
  },
  name: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
    minHeight: 38,
  },
  brand: {
    color: Theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  price: {
    color: Theme.colors.primary,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  stockText: {
    color: Theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  outOfStockText: {
    color: Theme.colors.danger,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 3,
    minWidth: 0,
  },
  ratingText: {
    color: Theme.colors.text,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.text,
    borderRadius: Theme.radius.md,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  disabledAddButton: {
    backgroundColor: Theme.colors.border,
  },
  pressed: {
    opacity: 0.72,
  },
});
