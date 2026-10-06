export type PaymentMethod = 'COD' | 'VNPay' | 'MoMo' | 'ChuyenKhoan';

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  birthday?: string;
  gender?: string;
};

export type Address = {
  id: string;
  userId?: string;
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
};

export type AddressInput = Omit<Address, 'id' | 'userId' | 'isDefault'> & {
  isDefault?: boolean;
};

export type Voucher = {
  id: string;
  code: string;
  name: string;
  discount: number;
  type?: 'phan_tram' | 'tien_mat';
  value?: number;
  maxDiscount?: number | null;
  minOrderValue: number;
  quantity?: number;
  startsAt?: string;
  endsAt?: string;
  status?: 'active' | 'inactive' | 'expired';
};
