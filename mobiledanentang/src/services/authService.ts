import { currentUser, wait } from './api';
import { BACKEND_API_URL, registerBackendUser } from './backendApi';
import type { User } from '@/types/user';

type RawLoginUser = {
  AnhDaiDien?: string | null;
  Email?: string | null;
  GioiTinh?: string | null;
  HoTen: string;
  MaNguoiDung: number;
  NgaySinh?: string | null;
  SoDienThoai?: string | null;
};

type LoginResponse = {
  user: RawLoginUser;
};

function mapLoginUser(user: RawLoginUser): User {
  return {
    id: String(user.MaNguoiDung),
    fullName: user.HoTen,
    email: user.Email || '',
    phone: user.SoDienThoai || '',
    avatar: user.AnhDaiDien || currentUser.avatar,
    birthday: user.NgaySinh || currentUser.birthday,
    gender: user.GioiTinh || currentUser.gender,
  };
}

export async function login(identifier: string, password: string) {
  const response = await fetch(`${BACKEND_API_URL}/nguoidung/login`, {
    body: JSON.stringify({ identifier, password }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message ?? 'Đăng nhập không thành công.');
  }

  return mapLoginUser((data as LoginResponse).user);
}

export async function register(data: {
  email: string;
  fullName: string;
  password: string;
  phone: string;
}) {
  try {
    return await registerBackendUser(data);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    return wait(currentUser, 350);
  }
}

export const logout = async () => wait(true, 200);
