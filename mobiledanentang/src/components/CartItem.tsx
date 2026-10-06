import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCurrency, Theme } from '@/constants/theme';
import type { CartLine } from '@/types/product';
import QuantitySelector from './QuantitySelector';

type CartItemProps = {
  line: CartLine;
  onRemove: () => void;
  onSelect: () => void;
  onUpdateQuantity: (quantity: number) => void;
};

export default function CartItem({ line, onRemove, onSelect, onUpdateQuantity }: CartItemProps) {
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: line.selected }}
        onPress={onSelect}
        style={[
          styles.checkbox,
          {
            backgroundColor: line.selected ? Theme.colors.primary : Theme.colors.surface,
            borderColor: line.selected ? Theme.colors.primary : Theme.colors.border,
          },
        ]}>
        {line.selected ? <Ionicons color={Theme.colors.white} name="checkmark" size={15} /> : null}
      </Pressable>

      <Image source={{ uri: line.product.image }} style={styles.image} />

      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.name}>
          {line.product.name}
        </Text>
        {line.variant.size || line.variant.color ? (
          <Text style={styles.variantText}>
            {[line.variant.size ? `Size ${line.variant.size}` : '', line.variant.color]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        ) : null}
        <Text style={styles.price}>{formatCurrency(line.variant.price)}</Text>
        <View style={styles.footer}>
          <QuantitySelector
            max={line.variant.stock}
            onChange={onUpdateQuantity}
            value={line.quantity}
          />
          <Pressable
            accessibilityLabel="Xóa sản phẩm"
            accessibilityRole="button"
            onPress={onRemove}
            style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
            <Ionicons color={Theme.colors.danger} name="trash-outline" size={22} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  image: {
    backgroundColor: Theme.colors.surfaceMuted,
    borderRadius: Theme.radius.md,
    height: 82,
    width: 82,
  },
  body: {
    flex: 1,
    gap: Theme.spacing.xs,
    minWidth: 0,
  },
  name: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  price: {
    color: Theme.colors.primary,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  variantText: {
    color: Theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  removeButton: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  pressed: {
    opacity: 0.72,
  },
});
