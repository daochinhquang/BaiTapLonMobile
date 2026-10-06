import {
  categories as mockCategories,
  currentUser as mockUser,
  products as mockProducts,
} from "./api";
import { API_BASE_URL } from "./apiConfig";
import type {
  CartItem,
  Category,
  Product,
  ProductVariant,
} from "@/types/product";
import type { Order } from "@/types/order";
import type {
  Address,
  AddressInput,
  PaymentMethod,
  User,
  Voucher,
} from "@/types/user";

type RawDanhMuc = {
  HinhAnh?: string | null;
  MaDanhMuc: number;
  MoTa?: string | null;
  TenDanhMuc: string;
  TrangThai?: string | null;
};

type RawLoaiSanPham = {
  MaDanhMuc: number;
  MaLoaiSanPham: number;
  TenLoaiSanPham: string;
};

type RawSanPham = {
  AnhDaiDien?: string | null;
  GiaBan: number | string;
  HinhAnhKhac?: string | null;
  MaDanhMuc?: number | null;
  MaLoaiSanPham: number;
  MaSanPham: number;
  MoTa?: string | null;
  SoLuongTon: number | string;
  TenDanhMuc?: string | null;
  TenLoaiSanPham?: string | null;
  TenNhaCungCap?: string | null;
  TenSanPham: string;
  ThuongHieu?: string | null;
  TrangThai?: string | null;
  BienThe?: RawBienThe[] | string | null;
};

type RawBienThe = {
  GiaBan: number | string;
  KichThuoc?: string | null;
  MaBienThe: number;
  MauSac?: string | null;
  SoLuongTon: number | string;
  TrangThai?: string | null;
};

type RawNguoiDung = {
  AnhDaiDien?: string | null;
  Email?: string | null;
  GioiTinh?: string | null;
  HoTen: string;
  MaNguoiDung: number;
  NgaySinh?: string | null;
  SoDienThoai?: string | null;
  VaiTro?: string | null;
};

type RawDiaChi = {
  DiaChiChiTiet: string;
  MaDiaChi: number;
  MaNguoiDung: number;
  MacDinh?: boolean | 0 | 1;
  PhuongXa: string;
  QuanHuyen: string;
  SoDienThoai: string;
  TenNguoiNhan: string;
  TinhThanh: string;
};

type RawMaGiamGia = {
  GiaTriDonHangToiThieu?: number | string | null;
  GiaTriGiam: number | string;
  LoaiGiam?: "phan_tram" | "tien_mat" | null;
  MaCode: string;
  MaGiamGia: number;
  MucGiamToiDa?: number | string | null;
  NgayBatDau?: string | null;
  NgayKetThuc?: string | null;
  SoLuong?: number | string | null;
  SoTienGiam?: number | string | null;
  TenMaGiamGia: string;
  TrangThai?: "active" | "inactive" | "expired" | null;
};

type RawCartLine = RawSanPham & {
  GiaBienThe: number | string;
  KichThuoc?: string | null;
  MaChiTietGioHang: number;
  MaGioHang: number;
  MaBienThe: number;
  MauSac?: string | null;
  SoLuong: number | string;
  SoLuongTonBienThe: number | string;
  TrangThaiBienThe?: string | null;
};

type RawOrderItem = RawSanPham & {
  DonGia: number | string;
  MaChiTietDonHang: number;
  MaDonHang: number;
  MaBienThe: number;
  KichThuoc?: string | null;
  MauSac?: string | null;
  SoLuong: number | string;
  ThanhTien?: number | string;
};

type RawOrder = {
  DiaChiChiTiet: string;
  GhiChu?: string | null;
  MaDiaChi: number;
  MaDonHang: number;
  MaGiamGia?: number | null;
  MaNguoiDung: number;
  NgayTao: string;
  PhiVanChuyen: number | string;
  PhuongThucThanhToan: PaymentMethod;
  PhuongXa: string;
  QuanHuyen: string;
  SoDienThoaiNhan: string;
  SoTienGiam: number | string;
  TenNguoiNhan: string;
  TinhThanh: string;
  TongThanhToan: number | string;
  TongTienHang: number | string;
  TrangThaiDonHang: Order["status"];
  TrangThaiThanhToan: Order["paymentStatus"];
  items?: RawOrderItem[];
};

type BackendShopData = {
  addresses: Address[];
  cartItems: CartItem[];
  categories: Category[];
  orders: Order[];
  products: Product[];
  user: User;
  vouchers: Voucher[];
};

export const BACKEND_API_URL = API_BASE_URL;

function toBackendUrl(path: string) {
  return `${BACKEND_API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(toBackendUrl(path), {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message ?? `Backend request failed: ${path}`);
  }

  return data as T;
}

function asNumber(value: number | string | null | undefined, fallback = 0) {
  const numberValue = Number(value ?? fallback);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeImageUrl(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (/^https?:\/\//i.test(value) || /^data:image\//i.test(value)) {
    return value;
  }

  return fallback;
}

function splitImages(value?: string | null) {
  return value ? value.split("||").filter(Boolean) : [];
}

function mapVariant(variant: RawBienThe): ProductVariant {
  return {
    color: variant.MauSac || "",
    id: String(variant.MaBienThe),
    price: asNumber(variant.GiaBan),
    size: variant.KichThuoc || "",
    status:
      variant.TrangThai === "inactive"
        ? "inactive"
        : asNumber(variant.SoLuongTon) > 0
          ? "active"
          : "out_of_stock",
    stock: asNumber(variant.SoLuongTon),
  };
}

function parseVariants(value: RawSanPham["BienThe"]) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as RawBienThe[]) : [];
  } catch {
    return [];
  }
}

function mapCategory(category: RawDanhMuc, index: number): Category {
  const fallback =
    mockCategories[index % mockCategories.length] ?? mockCategories[0];

  return {
    color: fallback.color,
    description: category.MoTa || fallback.description,
    icon: fallback.icon,
    id: String(category.MaDanhMuc),
    image: normalizeImageUrl(category.HinhAnh, fallback.image),
    name: category.TenDanhMuc,
  };
}

function mapProduct(
  product: RawSanPham,
  index: number,
  categoryByProductType: Map<number, number>,
): Product {
  const fallback = mockProducts[index % mockProducts.length] ?? mockProducts[0];
  const mainImage = normalizeImageUrl(product.AnhDaiDien, fallback.image);
  const images = [
    mainImage,
    ...splitImages(product.HinhAnhKhac).map((image) =>
      normalizeImageUrl(image, fallback.image),
    ),
  ].filter(
    (image, imageIndex, allImages) => allImages.indexOf(image) === imageIndex,
  );
  const categoryId =
    product.MaDanhMuc ??
    categoryByProductType.get(product.MaLoaiSanPham) ??
    product.MaLoaiSanPham;
  const variants = parseVariants(product.BienThe).map(mapVariant);

  return {
    brand: product.ThuongHieu || fallback.brand,
    category: String(categoryId),
    categoryName: product.TenDanhMuc || undefined,
    description: product.MoTa || fallback.description,
    featured: product.TrangThai !== "inactive",
    id: String(product.MaSanPham),
    image: mainImage,
    images: images.length ? images : [mainImage],
    name: product.TenSanPham,
    price: asNumber(product.GiaBan),
    rating: fallback.rating,
    reviewCount: fallback.reviewCount,
    stock: asNumber(product.SoLuongTon),
    typeId: String(product.MaLoaiSanPham),
    typeName: product.TenLoaiSanPham || undefined,
    variants,
  };
}

function mapUser(user: RawNguoiDung | null): User {
  if (!user) {
    return mockUser;
  }

  return {
    avatar: user.AnhDaiDien || mockUser.avatar,
    birthday: user.NgaySinh || mockUser.birthday,
    email: user.Email || "",
    fullName: user.HoTen,
    gender: user.GioiTinh || mockUser.gender,
    id: String(user.MaNguoiDung),
    phone: user.SoDienThoai || "",
  };
}

function mapAddress(address: RawDiaChi): Address {
  return {
    detail: address.DiaChiChiTiet,
    district: address.QuanHuyen,
    id: String(address.MaDiaChi),
    isDefault: Boolean(address.MacDinh),
    phone: address.SoDienThoai,
    province: address.TinhThanh,
    receiverName: address.TenNguoiNhan,
    userId: String(address.MaNguoiDung),
    ward: address.PhuongXa,
  };
}

function mapVoucher(voucher: RawMaGiamGia): Voucher {
  const type = voucher.LoaiGiam === "phan_tram" ? "phan_tram" : "tien_mat";
  const value = asNumber(voucher.GiaTriGiam);

  return {
    code: voucher.MaCode,
    discount: asNumber(voucher.SoTienGiam, type === "tien_mat" ? value : 0),
    id: String(voucher.MaGiamGia),
    maxDiscount:
      voucher.MucGiamToiDa === null || voucher.MucGiamToiDa === undefined
        ? null
        : asNumber(voucher.MucGiamToiDa),
    minOrderValue: asNumber(voucher.GiaTriDonHangToiThieu),
    name: voucher.TenMaGiamGia,
    quantity: asNumber(voucher.SoLuong),
    startsAt: voucher.NgayBatDau ?? undefined,
    endsAt: voucher.NgayKetThuc ?? undefined,
    status: voucher.TrangThai || "active",
    type,
    value,
  };
}

function orderAddress(order: RawOrder): Address {
  return {
    detail: order.DiaChiChiTiet,
    district: order.QuanHuyen,
    id: String(order.MaDiaChi),
    isDefault: true,
    phone: order.SoDienThoaiNhan,
    province: order.TinhThanh,
    receiverName: order.TenNguoiNhan,
    userId: String(order.MaNguoiDung),
    ward: order.PhuongXa,
  };
}

function createCategoryLookup(products: Product[]) {
  return new Map(products.map((product) => [product.id, product]));
}

function mapOrder(order: RawOrder, productsById: Map<string, Product>): Order {
  const items = (order.items ?? []).map((item, index) => {
    const knownProduct = productsById.get(String(item.MaSanPham));
    const fallbackProduct =
      knownProduct ??
      mapProduct(
        item,
        index,
        new Map([[item.MaLoaiSanPham, item.MaDanhMuc ?? item.MaLoaiSanPham]]),
      );

    return {
      price: asNumber(item.DonGia, fallbackProduct.price),
      product: fallbackProduct,
      quantity: asNumber(item.SoLuong, 1),
      variant: {
        color: item.MauSac || "",
        id: String(item.MaBienThe),
        price: asNumber(item.DonGia, fallbackProduct.price),
        size: item.KichThuoc || "",
        status: "active" as const,
        stock: 0,
      },
    };
  });

  return {
    address: orderAddress(order),
    code: `DH${String(order.MaDonHang).padStart(6, "0")}`,
    date: order.NgayTao,
    discount: asNumber(order.SoTienGiam),
    id: String(order.MaDonHang),
    items,
    paymentMethod: order.PhuongThucThanhToan,
    paymentStatus: order.TrangThaiThanhToan,
    shippingFee: asNumber(order.PhiVanChuyen),
    status: order.TrangThaiDonHang,
    subtotal: asNumber(order.TongTienHang),
    total: asNumber(order.TongThanhToan),
  };
}

function addressToBackend(address: AddressInput) {
  return {
    DiaChiChiTiet: address.detail,
    MacDinh: Boolean(address.isDefault),
    PhuongXa: address.ward,
    QuanHuyen: address.district,
    SoDienThoai: address.phone,
    TenNguoiNhan: address.receiverName,
    TinhThanh: address.province,
  };
}

export async function fetchBackendCatalog() {
  const [rawCategories, rawProductTypes, rawProducts] = await Promise.all([
    apiRequest<RawDanhMuc[]>("/danhmuc"),
    apiRequest<RawLoaiSanPham[]>("/loaisanpham"),
    apiRequest<RawSanPham[]>("/sanpham"),
  ]);
  const categoryByProductType = new Map(
    rawProductTypes.map((productType) => [
      productType.MaLoaiSanPham,
      productType.MaDanhMuc,
    ]),
  );
  const products = rawProducts.length
    ? rawProducts.map((product, index) =>
        mapProduct(product, index, categoryByProductType),
      )
    : mockProducts;

  return {
    categories: rawCategories.length
      ? rawCategories.map(mapCategory)
      : mockCategories,
    products,
  };
}

export async function fetchBackendShopData(
  authenticatedUserId?: string | null,
): Promise<BackendShopData> {
  const [catalog, rawUsers, vouchers] = await Promise.all([
    fetchBackendCatalog(),
    apiRequest<RawNguoiDung[]>("/nguoidung").catch(() => []),
    fetchBackendVouchers(authenticatedUserId || undefined).catch(() => []),
  ]);
  const { categories, products } = catalog;
  const mobileUser =
    rawUsers.find(
      (item) =>
        String(item.MaNguoiDung) === authenticatedUserId &&
        item.VaiTro === "user",
    ) ?? null;
  const user = mapUser(mobileUser);
  const productsById = createCategoryLookup(products);
  const [addresses, cartItems, orders] = mobileUser
    ? await Promise.all([
        fetchBackendAddresses(String(mobileUser.MaNguoiDung)).catch(() => []),
        fetchBackendCart(String(mobileUser.MaNguoiDung)).catch(() => []),
        fetchBackendOrders(String(mobileUser.MaNguoiDung), productsById).catch(
          () => [],
        ),
      ])
    : [[], [], []];
  return {
    addresses,
    cartItems,
    categories,
    orders,
    products,
    user,
    vouchers,
  };
}

export async function fetchBackendAddresses(userId: string) {
  const data = await apiRequest<RawDiaChi[]>(`/diachi/user/${userId}`);

  return data.map(mapAddress);
}

export async function fetchBackendCart(userId: string) {
  const data = await apiRequest<RawCartLine[]>(`/giohang/user/${userId}`);

  return data.map<CartItem>((item) => ({
    productId: String(item.MaSanPham),
    quantity: asNumber(item.SoLuong, 1),
    selected: true,
    variantId: String(item.MaBienThe),
  }));
}

export async function addBackendCartItem(
  userId: string,
  productId: string,
  variantId: string,
  quantity: number,
) {
  const data = await apiRequest<RawCartLine[]>(
    `/giohang/user/${userId}/items`,
    {
      body: JSON.stringify({
        MaBienThe: variantId,
        MaSanPham: productId,
        SoLuong: quantity,
      }),
      method: "POST",
    },
  );

  return data.map<CartItem>((item) => ({
    productId: String(item.MaSanPham),
    quantity: asNumber(item.SoLuong, 1),
    selected: true,
    variantId: String(item.MaBienThe),
  }));
}

export async function updateBackendCartItem(
  userId: string,
  productId: string,
  variantId: string,
  quantity: number,
) {
  const data = await apiRequest<RawCartLine[]>(
    `/giohang/user/${userId}/items/${productId}/variants/${variantId}`,
    {
      body: JSON.stringify({ SoLuong: quantity }),
      method: "PUT",
    },
  );

  return data.map<CartItem>((item) => ({
    productId: String(item.MaSanPham),
    quantity: asNumber(item.SoLuong, 1),
    selected: true,
    variantId: String(item.MaBienThe),
  }));
}

export async function deleteBackendCartItem(
  userId: string,
  productId: string,
  variantId: string,
) {
  const data = await apiRequest<RawCartLine[]>(
    `/giohang/user/${userId}/items/${productId}/variants/${variantId}`,
    {
      method: "DELETE",
    },
  );

  return data.map<CartItem>((item) => ({
    productId: String(item.MaSanPham),
    quantity: asNumber(item.SoLuong, 1),
    selected: true,
    variantId: String(item.MaBienThe),
  }));
}

export async function fetchBackendOrders(
  userId: string,
  productsById: Map<string, Product>,
) {
  const list = await apiRequest<RawOrder[]>(`/donhang/user/${userId}`);
  const details = await Promise.all(
    list.map((order) =>
      apiRequest<RawOrder>(`/donhang/user/${userId}/${order.MaDonHang}`).catch(
        () => order,
      ),
    ),
  );

  return details.map((order) => mapOrder(order, productsById));
}

export async function checkBackendHealth() {
  return apiRequest<{ status: string; service: string }>("/health");
}

export async function fetchBackendVouchers(userId?: string) {
  const query = userId && /^\d+$/.test(userId) ? `?userId=${encodeURIComponent(userId)}` : '';
  const vouchers = await apiRequest<RawMaGiamGia[]>(`/magiamgia/available${query}`);
  return vouchers.map(mapVoucher);
}

export async function validateBackendVoucher(code: string, subtotal: number, userId?: string) {
  const voucher = await apiRequest<RawMaGiamGia>("/magiamgia/validate", {
    body: JSON.stringify({ MaCode: code, TongTienHang: subtotal, MaNguoiDung: userId }),
    method: "POST",
  });

  return mapVoucher(voucher);
}

export async function updateBackendUserProfile(user: User) {
  const data = await apiRequest<{ user: RawNguoiDung }>(
    `/nguoidung/${user.id}/profile`,
    {
      body: JSON.stringify({
        AnhDaiDien: user.avatar,
        Email: user.email,
        GioiTinh: user.gender,
        HoTen: user.fullName,
        NgaySinh: user.birthday,
        SoDienThoai: user.phone,
      }),
      method: "PUT",
    },
  );

  return mapUser(data.user);
}

export async function createBackendAddress(
  userId: string,
  address: AddressInput,
) {
  const data = await apiRequest<RawDiaChi[]>(`/diachi/user/${userId}`, {
    body: JSON.stringify(addressToBackend(address)),
    method: "POST",
  });

  return data.map(mapAddress);
}

export async function updateBackendAddress(
  userId: string,
  addressId: string,
  address: AddressInput,
) {
  const data = await apiRequest<RawDiaChi[]>(
    `/diachi/user/${userId}/${addressId}`,
    {
      body: JSON.stringify(addressToBackend(address)),
      method: "PUT",
    },
  );

  return data.map(mapAddress);
}

export async function deleteBackendAddress(userId: string, addressId: string) {
  const data = await apiRequest<RawDiaChi[]>(
    `/diachi/user/${userId}/${addressId}`,
    {
      method: "DELETE",
    },
  );

  return data.map(mapAddress);
}

export async function setBackendDefaultAddress(
  userId: string,
  addressId: string,
) {
  const data = await apiRequest<RawDiaChi[]>(
    `/diachi/user/${userId}/${addressId}/default`,
    {
      method: "PUT",
    },
  );

  return data.map(mapAddress);
}

export async function placeBackendOrder(params: {
  clearCart?: boolean;
  addressId: string;
  items: { productId: string; quantity: number; variantId: string }[];
  paymentMethod: PaymentMethod;
  productsById: Map<string, Product>;
  userId: string;
  voucherId?: string;
}) {
  const order = await apiRequest<RawOrder>("/donhang/checkout", {
    body: JSON.stringify({
      MaDiaChi: params.addressId,
      clearCart: params.clearCart === true,
      MaGiamGia: params.voucherId || null,
      MaNguoiDung: params.userId,
      PhuongThucThanhToan: params.paymentMethod,
      items: params.items.map((item) => ({
        MaSanPham: item.productId,
        MaBienThe: item.variantId,
        SoLuong: item.quantity,
      })),
    }),
    method: "POST",
  });

  return mapOrder(order, params.productsById);
}

export async function cancelBackendOrder(
  userId: string,
  orderId: string,
  productsById: Map<string, Product>,
) {
  const order = await apiRequest<RawOrder>(
    `/donhang/user/${userId}/${orderId}/cancel`,
    {
      method: "PUT",
    },
  );

  return mapOrder(order, productsById);
}

export async function changeBackendPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  return apiRequest<{ message: string }>(`/nguoidung/${userId}/password`, {
    body: JSON.stringify({ currentPassword, newPassword }),
    method: "PUT",
  });
}

export async function registerBackendUser(data: {
  email: string;
  fullName: string;
  password: string;
  phone: string;
}) {
  const response = await apiRequest<{ user: RawNguoiDung }>(
    "/nguoidung/register",
    {
      body: JSON.stringify({
        Email: data.email || null,
        HoTen: data.fullName,
        MatKhau: data.password,
        SoDienThoai: data.phone || null,
      }),
      method: "POST",
    },
  );

  return mapUser(response.user);
}
