import type { CartItem, CartLine, CartSummary, Product, ProductVariant } from '@/types/product';
import type { Voucher } from '@/types/user';

export function getDefaultVariant(product: Product): ProductVariant {
  return product.variants?.find((variant) => variant.status !== 'inactive' && variant.stock > 0)
    ?? product.variants?.find((variant) => variant.status !== 'inactive')
    ?? {
      color: '',
      id: `${product.id}-default`,
      price: product.price,
      size: '',
      status: product.stock > 0 ? 'active' : 'out_of_stock',
      stock: product.stock,
    };
}

export function buildCartLines(
  items: CartItem[],
  products: Product[],
  selectedOnly = false
): CartLine[] {
  return items.reduce<CartLine[]>((result, item) => {
    if (selectedOnly && !item.selected) {
      return result;
    }

    const product = products.find((entry) => entry.id === item.productId);

    if (product) {
      const variant = product.variants?.find((entry) => entry.id === item.variantId)
        ?? getDefaultVariant(product);
      result.push({ product, quantity: item.quantity, selected: item.selected, variant });
    }

    return result;
  }, []);
}

export function calculateVoucherDiscount(voucher: Voucher | undefined, subtotal: number) {
  if (!voucher || subtotal < voucher.minOrderValue) {
    return 0;
  }

  const discountType = voucher.type ?? 'tien_mat';
  const discountValue = voucher.value ?? voucher.discount;
  const rawDiscount = discountType === 'phan_tram'
    ? subtotal * (discountValue / 100)
    : discountValue;
  const cappedDiscount = voucher.maxDiscount !== null && voucher.maxDiscount !== undefined
    ? Math.min(rawDiscount, voucher.maxDiscount)
    : rawDiscount;

  return Math.round(Math.min(subtotal, Math.max(0, cappedDiscount)) * 100) / 100;
}

export function calculateCartSummary(lines: CartLine[], voucherDiscount = 0): CartSummary {
  const subtotal = lines.reduce((total, line) => total + line.variant.price * line.quantity, 0);
  const shippingFee = subtotal === 0 || subtotal >= 1500000 ? 0 : 30000;
  const discount = Math.min(voucherDiscount, subtotal);

  return {
    subtotal,
    discount,
    shippingFee,
    total: Math.max(0, subtotal + shippingFee - discount),
  };
}
