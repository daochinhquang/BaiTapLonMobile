import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/adminSession";

const BACKEND_API_URL = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  "http://localhost:4000/api"
).replace(/\/$/, "");

export async function POST(request) {
  let credentials;

  try {
    credentials = await request.json();
  } catch {
    return Response.json(
      { message: "Thông tin đăng nhập không hợp lệ." },
      { status: 400 },
    );
  }

  if (
    typeof credentials.identifier !== "string" ||
    typeof credentials.password !== "string"
  ) {
    return Response.json(
      { message: "Vui lòng nhập tài khoản và mật khẩu." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}/admin/login`, {
      body: JSON.stringify(credentials),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const data = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return Response.json(
        { message: data?.message || "Đăng nhập không thành công." },
        { status: backendResponse.status },
      );
    }

    if (
      !data?.token ||
      data.user?.role !== "admin" ||
      !verifyAdminSession(data.token)
    ) {
      return Response.json(
        { message: "Không thể xác thực phiên quản trị." },
        { status: 502 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, data.token, {
      httpOnly: true,
      maxAge: 8 * 60 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return Response.json({ user: data.user });
  } catch {
    return Response.json(
      { message: "Không kết nối được máy chủ. Vui lòng thử lại." },
      { status: 502 },
    );
  }
}
