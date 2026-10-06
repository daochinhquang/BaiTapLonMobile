import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/adminSession";

const BACKEND_API_URL = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  "http://localhost:4000/api"
).replace(/\/$/, "");

async function forward(request, context) {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;

  if (!verifyAdminSession(token)) {
    return Response.json(
      { message: "Vui lòng đăng nhập tài khoản quản trị." },
      { status: 401 },
    );
  }

  const { path } = await context.params;
  const targetPath = path
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const targetUrl = `${BACKEND_API_URL}/admin/${targetPath}${new URL(request.url).search}`;
  const headers = new Headers({ Authorization: `Bearer ${token}` });
  const contentType = request.headers.get("content-type");

  if (contentType) headers.set("Content-Type", contentType);

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const backendResponse = await fetch(targetUrl, {
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
    headers,
    method: request.method,
  });
  const responseHeaders = new Headers();
  const backendContentType = backendResponse.headers.get("content-type");

  if (backendContentType)
    responseHeaders.set("Content-Type", backendContentType);

  const responseBody = [204, 205, 304].includes(backendResponse.status)
    ? null
    : await backendResponse.arrayBuffer();

  return new Response(responseBody, {
    headers: responseHeaders,
    status: backendResponse.status,
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
