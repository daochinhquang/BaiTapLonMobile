import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import QuantitySelector from '@/components/QuantitySelector';
import { formatCurrency, Theme } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';
import { getDefaultVariant } from '@/services/cartService';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, getCategoryById, getProductById, isFavorite, toggleFavorite } = useShop();
  const { width } = useWindowDimensions();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const product = getProductById(id);

  if (!product) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Header showBack title="Chi tiết sản phẩm" />
        <View style={styles.emptyWrap}>
          <EmptyState text="Sản phẩm này không còn trong dữ liệu mẫu." title="Không tìm thấy sản phẩm" />
        </View>
      </SafeAreaView>
    );
  }

  const category = getCategoryById(product.category);
  const liked = isFavorite(product.id);
  const imageWidth = Math.min(width, 520) - Theme.spacing.lg * 2;
  const productId = product.id;
  const productName = product.name;
  const selectedVariant = product.variants?.find((variant) => variant.id === selectedVariantId)
    ?? getDefaultVariant(product);
  const activeVariants = product.variants?.filter((variant) => variant.status !== 'inactive')
    ?? [selectedVariant];
  const sizes = [...new Set(activeVariants.map((variant) => variant.size).filter(Boolean))];
  const colors = [...new Set(
    activeVariants
      .filter((variant) => !selectedVariant.size || variant.size === selectedVariant.size)
      .map((variant) => variant.color)
      .filter(Boolean)
  )];
  const isOutOfStock = selectedVariant.stock <= 0;

  function selectSize(size: string) {
    const nextVariant = activeVariants.find(
      (variant) => variant.size === size && variant.color === selectedVariant.color && variant.stock > 0
    ) ?? activeVariants.find((variant) => variant.size === size && variant.stock > 0)
      ?? activeVariants.find((variant) => variant.size === size);
    if (nextVariant) {
      setSelectedVariantId(nextVariant.id);
      setQuantity(1);
    }
  }

  function selectColor(color: string) {
    const nextVariant = activeVariants.find(
      (variant) => variant.size === selectedVariant.size && variant.color === color
    );
    if (nextVariant) {
      setSelectedVariantId(nextVariant.id);
      setQuantity(1);
    }
  }

  function handleAddToCart() {
    if (isOutOfStock) {
      Alert.alert('Hết hàng', 'Sản phẩm này hiện chưa còn tồn kho.');
      return;
    }

    addToCart(productId, quantity, selectedVariant.id);
    const variantLabel = [selectedVariant.size ? `size ${selectedVariant.size}` : '', selectedVariant.color]
      .filter(Boolean)
      .join(', ');
    Alert.alert(
      'Đã thêm vào giỏ hàng',
      `${quantity} x ${productName}${variantLabel ? ` (${variantLabel})` : ''}`
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Header showBack title="Chi tiết sản phẩm" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.imageStage}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {product.images.map((image) => (
              <Image key={image} source={{ uri: image }} style={[styles.heroImage, { width: imageWidth }]} />
            ))}
          </ScrollView>
          <Pressable
            accessibilityLabel="Yêu thích"
            accessibilityRole="button"
            onPress={() => toggleFavorite(product.id)}
            style={styles.favoriteButton}>
            <Ionicons
              color={liked ? Theme.colors.accent : Theme.colors.text}
              name={liked ? 'heart' : 'heart-outline'}
              size={24}
            />
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatCurrency(selectedVariant.price)}</Text>
          <View style={styles.ratingRow}>
            <Ionicons color={Theme.colors.warning} name="star" size={17} />
            <Text style={styles.ratingText}>
              {product.rating} ({product.reviewCount} đánh giá)
            </Text>
          </View>
          <View style={styles.metaGrid}>
            <Meta label="Thương hiệu" value={product.brand} />
            <Meta label="Danh mục" value={category?.name ?? 'Sản phẩm'} />
            <Meta label="Loại" value={product.typeName ?? 'Tiêu chuẩn'} />
          </View>
          {sizes.length ? (
            <VariantSelector
              label="Size"
              onSelect={selectSize}
              options={sizes}
              selected={selectedVariant.size}
            />
          ) : null}
          {colors.length ? (
            <VariantSelector
              label="Màu sắc"
              onSelect={selectColor}
              options={colors}
              selected={selectedVariant.color}
            />
          ) : null}
          <View style={styles.stockBox}>
            <Ionicons
              color={isOutOfStock ? Theme.colors.danger : Theme.colors.primary}
              name={isOutOfStock ? 'alert-circle-outline' : 'cube-outline'}
              size={18}
            />
            <Text style={[styles.stockText, isOutOfStock && styles.outOfStockText]}>
              {isOutOfStock ? 'Tạm hết hàng' : `Còn ${selectedVariant.stock} sản phẩm`}
            </Text>
          </View>
          <Text style={styles.descriptionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>{product.description}</Text>
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Số lượng</Text>
            <QuantitySelector max={selectedVariant.stock} onChange={setQuantity} value={quantity} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          disabled={isOutOfStock}
          onPress={handleAddToCart}
          style={({ pressed }) => [
            styles.outlineButton,
            isOutOfStock && styles.disabledButton,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.outlineText}>Thêm vào giỏ</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={isOutOfStock}
          onPress={() =>
            router.push({
              pathname: '/checkout',
              params: {
                productId: product.id,
                quantity: String(quantity),
                variantId: selectedVariant.id,
              },
            } as never)
          }
          style={({ pressed }) => [
            styles.primaryButton,
            isOutOfStock && styles.disabledPrimaryButton,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.primaryText}>Mua ngay</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function VariantSelector({
  label,
  onSelect,
  options,
  selected,
}: {
  label: string;
  onSelect: (value: string) => void;
  options: string[];
  selected: string;
}) {
  return (
    <View style={styles.variantGroup}>
      <Text style={styles.variantLabel}>{label}</Text>
      <View style={styles.variantOptions}>
        {options.map((option) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selected === option }}
            key={option}
            onPress={() => onSelect(option)}
            style={[styles.variantOption, selected === option && styles.selectedVariantOption]}>
            <Text style={[styles.variantOptionText, selected === option && styles.selectedVariantText]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.metaValue}>
        {value}
      </Text>
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
    paddingBottom: 120,
  },
  imageStage: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    height: 300,
  },
  favoriteButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: Theme.spacing.md,
    top: Theme.spacing.md,
    width: 44,
  },
  infoCard: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    gap: Theme.spacing.md,
    padding: Theme.spacing.lg,
  },
  name: {
    color: Theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  price: {
    color: Theme.colors.primary,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  ratingText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  variantGroup: {
    gap: Theme.spacing.sm,
  },
  variantLabel: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  variantOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  variantOption: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
    minWidth: 58,
    paddingHorizontal: Theme.spacing.md,
  },
  selectedVariantOption: {
    backgroundColor: Theme.colors.primarySoft,
    borderColor: Theme.colors.primary,
  },
  variantOptionText: {
    color: Theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  selectedVariantText: {
    color: Theme.colors.primaryDark,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  stockBox: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primarySoft,
    borderRadius: Theme.radius.md,
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
  },
  stockText: {
    color: Theme.colors.primaryDark,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  outOfStockText: {
    color: Theme.colors.danger,
  },
  metaItem: {
    backgroundColor: Theme.colors.surfaceMuted,
    borderRadius: Theme.radius.md,
    flex: 1,
    padding: Theme.spacing.sm,
  },
  metaLabel: {
    color: Theme.colors.muted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  metaValue: {
    color: Theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
    marginTop: 2,
  },
  descriptionTitle: {
    color: Theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
  },
  description: {
    color: Theme.colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
  },
  quantityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  footer: {
    backgroundColor: Theme.colors.surface,
    borderTopColor: Theme.colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: Theme.spacing.md,
    left: 0,
    padding: Theme.spacing.lg,
    position: 'absolute',
    right: 0,
  },
  outlineButton: {
    alignItems: 'center',
    borderColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  disabledButton: {
    borderColor: Theme.colors.border,
    opacity: 0.62,
  },
  outlineText: {
    color: Theme.colors.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  disabledPrimaryButton: {
    backgroundColor: Theme.colors.border,
  },
  primaryText: {
    color: Theme.colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.72,
  },
});
