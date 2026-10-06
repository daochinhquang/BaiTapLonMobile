import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type Category = {
  id: string;
  name: string;
  description: string;
  icon: IoniconName;
  image: string;
  color: string;
};

export type Product = {
  id: string;
  name: string;
  image: string;
  images: string[];
  price: number;
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  description: string;
  category: string;
  categoryName?: string;
  featured?: boolean;
  typeId?: string;
  typeName?: string;
  variants?: ProductVariant[];
};

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
};

export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
  selected: boolean;
};

export type CartLine = {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  selected: boolean;
};

export type CartSummary = {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
};
