export const categoryFilters = ['Tất cả', 'Thi đấu', 'Tập luyện', 'Bãi biển', 'Phụ kiện'] as const;

export type CategoryFilter = (typeof categoryFilters)[number];
export type ProductCategory = Exclude<CategoryFilter, 'Tất cả'>;

export type ShopCategory = {
  accentColor: string;
  detail: string;
  itemCount: string;
  name: ProductCategory;
  shortName: string;
};

export type PromoBanner = {
  accentColor: string;
  ballAccentColor: string;
  callout: string;
  seamColor: string;
  subtitle: string;
  title: string;
};

export type FeaturedProduct = {
  accentColor: string;
  badge: string;
  baseColor: string;
  category: ProductCategory;
  description: string;
  id: string;
  name: string;
  originalPrice: string;
  originalPriceValue: number;
  price: string;
  priceValue: number;
  rating: string;
  seamColor: string;
  sold: string;
  stock: string;
};

export const featuredProducts: FeaturedProduct[] = [
  {
    id: 'mikasa-v300w',
    name: 'Mikasa V300W',
    category: 'Thi đấu',
    badge: 'Bán chạy',
    price: '1.690.000đ',
    priceValue: 1690000,
    originalPrice: '1.950.000đ',
    originalPriceValue: 1950000,
    rating: '4.9',
    sold: '2.1k',
    stock: 'Còn 12',
    description: 'Da PU mềm, chuẩn FIVB cho sân trong nhà.',
    baseColor: '#FFFFFF',
    accentColor: '#2E6BE6',
    seamColor: '#F36C3D',
  },
  {
    id: 'molten-v5m5000',
    name: 'Molten V5M5000',
    category: 'Thi đấu',
    badge: 'Pro',
    price: '1.420.000đ',
    priceValue: 1420000,
    originalPrice: '1.690.000đ',
    originalPriceValue: 1690000,
    rating: '4.8',
    sold: '980',
    stock: 'Còn 8',
    description: 'Độ nảy ổn định, bám tay khi chuyền một.',
    baseColor: '#F8FAFC',
    accentColor: '#19A974',
    seamColor: '#1F2937',
  },
  {
    id: 'training-soft-touch',
    name: 'Soft Touch 5',
    category: 'Tập luyện',
    badge: 'Êm tay',
    price: '390.000đ',
    priceValue: 390000,
    originalPrice: '520.000đ',
    originalPriceValue: 520000,
    rating: '4.7',
    sold: '3.4k',
    stock: 'Còn 35',
    description: 'Phù hợp CLB, trường học và người mới chơi.',
    baseColor: '#FFF8E6',
    accentColor: '#E84A5F',
    seamColor: '#264653',
  },
  {
    id: 'club-duraflex',
    name: 'Club Duraflex',
    category: 'Tập luyện',
    badge: 'Bền da',
    price: '520.000đ',
    priceValue: 520000,
    originalPrice: '650.000đ',
    originalPriceValue: 650000,
    rating: '4.6',
    sold: '1.1k',
    stock: 'Còn 28',
    description: 'Lớp da chịu mài mòn tốt cho lịch tập dày.',
    baseColor: '#F8FAFC',
    accentColor: '#19A974',
    seamColor: '#F36C3D',
  },
  {
    id: 'beach-wave',
    name: 'Beach Wave',
    category: 'Bãi biển',
    badge: 'Ngoài trời',
    price: '740.000đ',
    priceValue: 740000,
    originalPrice: '890.000đ',
    originalPriceValue: 890000,
    rating: '4.6',
    sold: '760',
    stock: 'Còn 18',
    description: 'Chống nước nhẹ, màu nổi bật khi chơi ngoài nắng.',
    baseColor: '#FFFDF5',
    accentColor: '#F4B942',
    seamColor: '#007C89',
  },
  {
    id: 'training-air-pump',
    name: 'Bơm kim đôi',
    category: 'Phụ kiện',
    badge: 'Gọn nhẹ',
    price: '160.000đ',
    priceValue: 160000,
    originalPrice: '220.000đ',
    originalPriceValue: 220000,
    rating: '4.5',
    sold: '1.5k',
    stock: 'Còn 42',
    description: 'Bơm tay nhỏ, kèm 2 kim thay thế cho đội bóng.',
    baseColor: '#EEF6FF',
    accentColor: '#2E6BE6',
    seamColor: '#177A4D',
  },
  {
    id: 'finger-tape-set',
    name: 'Băng ngón Pro',
    category: 'Phụ kiện',
    badge: 'CLB chọn',
    price: '95.000đ',
    priceValue: 95000,
    originalPrice: '140.000đ',
    originalPriceValue: 140000,
    rating: '4.6',
    sold: '2.8k',
    stock: 'Còn 60',
    description: 'Bảo vệ ngón khi đập bóng, chắn bóng và chuyền hai.',
    baseColor: '#FFF8E6',
    accentColor: '#E84A5F',
    seamColor: '#1F2937',
  },
];

export type CartItem = {
  productId: FeaturedProduct['id'];
  quantity: number;
};

export const initialCartItems: CartItem[] = [
  { productId: 'mikasa-v300w', quantity: 1 },
  { productId: 'training-soft-touch', quantity: 2 },
  { productId: 'beach-wave', quantity: 1 },
];

export function formatVnd(value: number) {
  return `${Math.max(0, value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
}

export const promoBanners: PromoBanner[] = [
  {
    callout: 'Sale 25%',
    title: 'Bóng thi đấu chính hãng',
    subtitle: 'Mikasa, Molten và bóng CLB được bơm test trước khi giao.',
    accentColor: '#173D2B',
    ballAccentColor: '#2E6BE6',
    seamColor: '#F36C3D',
  },
  {
    callout: 'Combo đội',
    title: 'Mua theo lô tiết kiệm hơn',
    subtitle: 'Set 6 bóng tập luyện kèm túi lưới cho sân trường và CLB.',
    accentColor: '#2E6BE6',
    ballAccentColor: '#F4B942',
    seamColor: '#FFFFFF',
  },
  {
    callout: 'Giao nhanh',
    title: 'Nhận bóng trong hôm nay',
    subtitle: 'Miễn phí giao nội thành cho đơn từ 1.500.000đ.',
    accentColor: '#E84A5F',
    ballAccentColor: '#19A974',
    seamColor: '#FFFDF5',
  },
];

export const shopCategories: ShopCategory[] = [
  {
    name: 'Thi đấu',
    shortName: 'Pro',
    detail: 'Chuẩn sân trong nhà',
    itemCount: '18 mẫu',
    accentColor: '#2E6BE6',
  },
  {
    name: 'Tập luyện',
    shortName: 'Train',
    detail: 'Êm tay, bền da',
    itemCount: '24 mẫu',
    accentColor: '#19A974',
  },
  {
    name: 'Bãi biển',
    shortName: 'Beach',
    detail: 'Chống nước nhẹ',
    itemCount: '10 mẫu',
    accentColor: '#F4B942',
  },
  {
    name: 'Phụ kiện',
    shortName: 'Gear',
    detail: 'Bơm, túi, băng ngón',
    itemCount: '32 món',
    accentColor: '#E84A5F',
  },
];

export const homeProductShelves = [
  {
    key: 'new-products',
    title: 'Sản phẩm mới',
    subtitle: 'Những mẫu bóng và phụ kiện vừa về kho.',
    productIds: ['club-duraflex', 'training-air-pump', 'beach-wave'],
  },
  {
    key: 'best-selling',
    title: 'Sản phẩm bán chạy',
    subtitle: 'Được các CLB và đội phong trào đặt nhiều nhất.',
    productIds: ['training-soft-touch', 'mikasa-v300w', 'finger-tape-set'],
  },
  {
    key: 'promotion-products',
    title: 'Khuyến mãi',
    subtitle: 'Giá tốt trong tuần, số lượng ưu đãi có hạn.',
    productIds: ['mikasa-v300w', 'molten-v5m5000', 'beach-wave'],
  },
] as const;

export const featuredCategorySections = [
  {
    category: 'Thi đấu',
    title: 'Dành cho giải đấu',
    subtitle: 'Bóng có độ nảy ổn định, phù hợp sân trong nhà.',
  },
  {
    category: 'Tập luyện',
    title: 'Dành cho tập luyện',
    subtitle: 'Giá tốt, bền và dễ kiểm soát cho đội mới.',
  },
  {
    category: 'Phụ kiện',
    title: 'Phụ kiện cần có',
    subtitle: 'Đủ đồ cho buổi tập: bơm, băng ngón và túi đựng.',
  },
] satisfies {
  category: ProductCategory;
  title: string;
  subtitle: string;
}[];

export const serviceHighlights = [
  {
    title: 'FIVB chuẩn',
    detail: 'Bóng thi đấu chính hãng, đủ size 5',
    tone: '#E7F8EE',
  },
  {
    title: 'Giao 2 giờ',
    detail: 'Nội thành với đơn có sẵn kho',
    tone: '#EAF3FF',
  },
  {
    title: 'Bơm và test',
    detail: 'Kiểm tra hơi trước khi giao',
    tone: '#FFF3E9',
  },
];

export const curatedBundles = [
  {
    title: 'Combo CLB mới',
    detail: '6 bóng tập luyện, 1 túi lưới, 1 bơm kim',
    price: '2.290.000đ',
    accentColor: '#19A974',
  },
  {
    title: 'Set thi đấu cuối tuần',
    detail: '2 bóng pro, bảng điểm mini, băng bảo vệ ngón',
    price: '3.150.000đ',
    accentColor: '#2E6BE6',
  },
  {
    title: 'Beach day kit',
    detail: '1 bóng bãi biển, khăn nhanh khô, túi chống cát',
    price: '1.090.000đ',
    accentColor: '#F4B942',
  },
];
