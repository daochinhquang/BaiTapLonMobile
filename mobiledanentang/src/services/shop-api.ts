import { API_BASE_URL as SHARED_API_BASE_URL } from './apiConfig';

export type GioiTinh = 'nam' | 'nu' | 'khac';

export type NguoiDung = {
  anh_dai_dien: string | null;
  diem_tich_luy: number;
  email: string | null;
  gioi_tinh: GioiTinh | null;
  ho_ten: string;
  ma_nguoi_dung: number;
  ma_vai_tro: number;
  ngay_cap_nhat: string;
  ngay_sinh: string | null;
  ngay_tao: string;
  so_dien_thoai: string | null;
  trang_thai: 'hoat_dong' | 'bi_khoa';
};

export type DiaChiNguoiDung = {
  dia_chi_chi_tiet: string;
  la_mac_dinh: boolean | 0 | 1;
  ma_dia_chi: number;
  ma_nguoi_dung: number;
  ngay_cap_nhat: string;
  ngay_tao: string;
  phuong_xa: string;
  quan_huyen: string;
  so_dien_thoai_nhan: string;
  ten_nguoi_nhan: string;
  tinh_thanh: string;
};

export type DonHang = {
  dia_chi_giao_hang: string;
  ghi_chu: string | null;
  ma_dia_chi: number | null;
  ma_don: string;
  ma_don_hang: number;
  ma_nguoi_dung: number;
  ma_phieu: number | null;
  ngay_cap_nhat: string;
  ngay_tao: string;
  phi_van_chuyen: number | string;
  phuong_thuc_thanh_toan: 'cod' | 'chuyen_khoan' | 'momo' | 'vnpay';
  so_dien_thoai_nhan: string;
  tam_tinh: number | string;
  ten_nguoi_nhan: string;
  tien_giam: number | string;
  tong_tien: number | string;
  trang_thai_don: 'cho_xac_nhan' | 'da_xac_nhan' | 'dang_giao' | 'hoan_tat' | 'da_huy';
  trang_thai_thanh_toan: 'chua_thanh_toan' | 'da_thanh_toan' | 'da_hoan_tien';
};

export type YeuThich = {
  ma_nguoi_dung: number;
  ma_san_pham: number;
  ma_yeu_thich: number;
  ngay_tao: string;
};

export type SanPham = {
  chat_lieu: string | null;
  diem_danh_gia: number | string;
  duong_dan: string;
  gia_ban: number | string;
  gia_goc: number | string | null;
  kich_co_bong: string | null;
  loai_san: string | null;
  ma_danh_muc: number;
  ma_san_pham: number;
  ma_sku: string;
  ma_thuong_hieu: number | null;
  mo_ta_ngan: string | null;
  nhan: string | null;
  so_luong_da_ban: number;
  so_luong_ton: number;
  ten_san_pham: string;
  trang_thai: 'hoat_dong' | 'het_hang' | 'an';
};

type JsonBody = Record<string, unknown> | unknown[];

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | JsonBody | null;
};

type LoginResponse = {
  user: NguoiDung;
};

type RegisterResponse = {
  id: number;
  user?: NguoiDung;
};

export const API_BASE_URL = SHARED_API_BASE_URL;

function makeUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function apiRequest<T>(path: string, options: ApiOptions = {}) {
  const hasJsonBody = options.body && typeof options.body === 'object' && !(options.body instanceof FormData);
  const response = await fetch(makeUrl(path), {
    ...options,
    body: hasJsonBody ? JSON.stringify(options.body) : (options.body as BodyInit | undefined),
    headers: {
      Accept: 'application/json',
      ...(hasJsonBody ? { 'Content-Type': 'application/json' } : null),
      ...options.headers,
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message ?? 'Không thể kết nối máy chủ VolleyMart.');
  }

  return data as T;
}

export function loginCustomer(identifier: string, password: string) {
  return apiRequest<LoginResponse>('/nguoi_dung/login', {
    body: { identifier, password },
    method: 'POST',
  });
}

export function registerCustomer(data: {
  email: string | null;
  ho_ten: string;
  mat_khau: string;
  so_dien_thoai: string | null;
}) {
  return apiRequest<RegisterResponse>('/nguoi_dung', {
    body: {
      ...data,
      diem_tich_luy: 0,
      ma_vai_tro: 2,
      trang_thai: 'hoat_dong',
    },
    method: 'POST',
  });
}

export function getCustomer(customerId: number) {
  return apiRequest<NguoiDung>(`/nguoi_dung/${customerId}`);
}

export function updateCustomer(customerId: number, data: Partial<NguoiDung>) {
  return apiRequest<{ message: string; user?: NguoiDung }>(`/nguoi_dung/${customerId}`, {
    body: data,
    method: 'PUT',
  });
}

export function getCustomerAddresses(customerId: number) {
  return apiRequest<DiaChiNguoiDung[]>(`/dia_chi_nguoi_dung/nguoi-dung/${customerId}`);
}

export function createCustomerAddress(data: Omit<DiaChiNguoiDung, 'ma_dia_chi' | 'ngay_cap_nhat' | 'ngay_tao'>) {
  return apiRequest<{ id: number }>('/dia_chi_nguoi_dung', {
    body: data,
    method: 'POST',
  });
}

export function updateCustomerAddress(addressId: number, data: Partial<DiaChiNguoiDung>) {
  return apiRequest<{ message: string }>(`/dia_chi_nguoi_dung/${addressId}`, {
    body: data,
    method: 'PUT',
  });
}

export function deleteCustomerAddress(addressId: number) {
  return apiRequest<{ message: string }>(`/dia_chi_nguoi_dung/${addressId}`, {
    method: 'DELETE',
  });
}

export function setDefaultCustomerAddress(addressId: number) {
  return apiRequest<{ message: string }>(`/dia_chi_nguoi_dung/${addressId}/mac-dinh`, {
    method: 'PATCH',
  });
}

export function getCustomerOrders(customerId: number) {
  return apiRequest<DonHang[]>(`/don_hang/nguoi-dung/${customerId}`);
}

export function getCustomerFavorites(customerId: number) {
  return apiRequest<YeuThich[]>(`/yeu_thich/nguoi-dung/${customerId}`);
}

export function getProducts() {
  return apiRequest<SanPham[]>('/san_pham');
}
