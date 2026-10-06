import type { Category, CartItem, Product } from '@/types/product';
import type { Order } from '@/types/order';
import type { Address, User, Voucher } from '@/types/user';

const volleyballImage =
  'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=900&q=80';
const indoorCourtImage =
  'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=900&q=80';
const shoeImage =
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80';
const apparelImage =
  'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80';
const accessoryImage =
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80';

export const categories: Category[] = [
  {
    id: 'bong-chuyen',
    name: 'Bóng chuyền',
    description: 'Bóng thi đấu và luyện tập',
    icon: 'basketball-outline',
    image: volleyballImage,
    color: '#00A36C',
  },
  {
    id: 'giay-bong-chuyen',
    name: 'Giày bóng chuyền',
    description: 'Giày bám sân, đệm êm',
    icon: 'footsteps-outline',
    image: shoeImage,
    color: '#2563EB',
  },
  {
    id: 'quan-ao',
    name: 'Quần áo',
    description: 'Áo đấu, quần tập, jersey',
    icon: 'shirt-outline',
    image: apparelImage,
    color: '#FF6B35',
  },
  {
    id: 'phu-kien',
    name: 'Phụ kiện',
    description: 'Băng gối, túi, bình nước',
    icon: 'fitness-outline',
    image: accessoryImage,
    color: '#8B5CF6',
  },
];

export const products: Product[] = [
  {
    id: 'mikasa-v200w',
    name: 'Mikasa V200W',
    image: volleyballImage,
    images: [volleyballImage, indoorCourtImage, accessoryImage],
    price: 1500000,
    brand: 'Mikasa',
    rating: 4.8,
    reviewCount: 120,
    stock: 24,
    description:
      'Bóng thi đấu chuẩn quốc tế, da microfiber mềm tay, độ nảy ổn định và phù hợp cho giải phong trào lẫn CLB.',
    category: 'bong-chuyen',
    featured: true,
  },
  {
    id: 'mikasa-v300w',
    name: 'Mikasa V300W',
    image: indoorCourtImage,
    images: [indoorCourtImage, volleyballImage, accessoryImage],
    price: 980000,
    brand: 'Mikasa',
    rating: 4.7,
    reviewCount: 86,
    stock: 31,
    description:
      'Phiên bản tập luyện cao cấp, bề mặt bám tốt và giữ form bền cho lịch tập cường độ cao.',
    category: 'bong-chuyen',
    featured: true,
  },
  {
    id: 'molten-v5m5000',
    name: 'Molten V5M5000',
    image: volleyballImage,
    images: [volleyballImage, indoorCourtImage],
    price: 1320000,
    brand: 'Molten',
    rating: 4.6,
    reviewCount: 74,
    stock: 18,
    description:
      'Mẫu bóng Molten nổi bật với cảm giác đánh chắc tay, đường bay ổn định và độ bền cao.',
    category: 'bong-chuyen',
    featured: true,
  },
  {
    id: 'bong-tap-luyen',
    name: 'Bóng chuyền tập luyện',
    image: indoorCourtImage,
    images: [indoorCourtImage, volleyballImage],
    price: 350000,
    brand: 'Thăng Long',
    rating: 4.5,
    reviewCount: 58,
    stock: 65,
    description:
      'Bóng tập mềm, dễ kiểm soát, phù hợp học sinh sinh viên và đội mới bắt đầu luyện kỹ thuật.',
    category: 'bong-chuyen',
    featured: true,
  },
  {
    id: 'giay-asics-rocket',
    name: 'Giày bóng chuyền Asics Gel Rocket 11',
    image: shoeImage,
    images: [shoeImage, indoorCourtImage],
    price: 1650000,
    brand: 'Asics',
    rating: 4.9,
    reviewCount: 102,
    stock: 14,
    description:
      'Giày sân trong nhà với đệm Gel êm, thân giày chắc và đế bám tốt cho các pha bật nhảy.',
    category: 'giay-bong-chuyen',
    featured: true,
  },
  {
    id: 'phu-kien-goi',
    name: 'Bộ phụ kiện bóng chuyền',
    image: accessoryImage,
    images: [accessoryImage, volleyballImage],
    price: 420000,
    brand: 'VolleyPro',
    rating: 4.4,
    reviewCount: 43,
    stock: 40,
    description:
      'Combo băng gối, băng cổ tay và túi rút, hỗ trợ bảo vệ khớp khi tập luyện thường xuyên.',
    category: 'phu-kien',
    featured: true,
  },
  {
    id: 'ao-dau-club',
    name: 'Áo đấu CLB Volleyball',
    image: apparelImage,
    images: [apparelImage, indoorCourtImage],
    price: 280000,
    brand: 'VolleyFit',
    rating: 4.3,
    reviewCount: 36,
    stock: 80,
    description:
      'Áo thi đấu thoáng khí, nhanh khô, form thể thao gọn gàng cho tập luyện và thi đấu.',
    category: 'quan-ao',
  },
];

export const initialCartItems: CartItem[] = [
  { productId: 'mikasa-v200w', quantity: 1, selected: true, variantId: 'mikasa-v200w-default' },
  { productId: 'bong-tap-luyen', quantity: 2, selected: true, variantId: 'bong-tap-luyen-default' },
];

export const currentUser: User = {
  id: 'user-1',
  fullName: 'Nguyễn Minh Anh',
  email: 'minhanh@example.com',
  phone: '0902 345 678',
  avatar:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  birthday: '10/05/2004',
  gender: 'Nam',
};

export const addresses: Address[] = [
  {
    id: 'address-1',
    receiverName: 'Nguyễn Minh Anh',
    phone: '0902 345 678',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 5',
    ward: 'Phường 4',
    detail: '24 Nguyễn Văn Cừ',
    isDefault: true,
  },
  {
    id: 'address-2',
    receiverName: 'CLB Bóng Chuyền Sao Mai',
    phone: '0918 222 333',
    province: 'TP. Hồ Chí Minh',
    district: 'TP. Thủ Đức',
    ward: 'Thảo Điền',
    detail: 'Sân thể thao số 8, đường Quốc Hương',
    isDefault: false,
  },
];

export const vouchers: Voucher[] = [
  {
    id: 'voucher-1',
    code: 'VOLLEY30',
    name: 'Giảm 30.000đ cho đơn từ 500.000đ',
    discount: 30000,
    minOrderValue: 500000,
  },
  {
    id: 'voucher-2',
    code: 'CLB120',
    name: 'Giảm 120.000đ cho đơn CLB từ 2.500.000đ',
    discount: 120000,
    minOrderValue: 2500000,
  },
];

export const initialFavoriteIds = ['mikasa-v200w', 'giay-asics-rocket'];

export const initialOrders: Order[] = [
  {
    id: 'order-1',
    code: 'DH240901',
    date: '2026-09-12T08:30:00.000Z',
    status: 'shipping',
    paymentStatus: 'paid',
    paymentMethod: 'VNPay',
    address: addresses[0],
    items: [
      { product: products[0], quantity: 1, price: products[0].price },
      { product: products[5], quantity: 1, price: products[5].price },
    ],
    subtotal: 1920000,
    discount: 30000,
    shippingFee: 0,
    total: 1890000,
  },
  {
    id: 'order-2',
    code: 'DH240830',
    date: '2026-09-08T14:10:00.000Z',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'COD',
    address: addresses[1],
    items: [{ product: products[3], quantity: 6, price: products[3].price }],
    subtotal: 2100000,
    discount: 30000,
    shippingFee: 0,
    total: 2070000,
  },
  {
    id: 'order-3',
    code: 'DH240826',
    date: '2026-09-03T09:45:00.000Z',
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: 'ChuyenKhoan',
    address: addresses[0],
    items: [{ product: products[4], quantity: 1, price: products[4].price }],
    subtotal: 1650000,
    discount: 0,
    shippingFee: 0,
    total: 1650000,
  },
];

export function wait<T>(data: T, timeout = 250) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), timeout);
  });
}
