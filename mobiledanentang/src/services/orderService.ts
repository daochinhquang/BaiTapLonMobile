import type { OrderStatus, PaymentStatus } from '@/types/order';
import type { PaymentMethod } from '@/types/user';

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Đã giao',
  cancelled: 'Đã hủy',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thanh toán lỗi',
  refunded: 'Đã hoàn tiền',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  COD: 'COD',
  VNPay: 'VNPay',
  MoMo: 'MoMo',
  ChuyenKhoan: 'Chuyển khoản',
};

export const orderTimeline: OrderStatus[] = ['pending', 'confirmed', 'shipping', 'completed'];
