import type { Product, ProductVariant } from './product';
import type { Address, PaymentMethod } from './user';

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export type OrderItem = {
  product: Product;
  quantity: number;
  price: number;
  variant?: ProductVariant;
};

export type Order = {
  id: string;
  code: string;
  date: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  address: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
};
