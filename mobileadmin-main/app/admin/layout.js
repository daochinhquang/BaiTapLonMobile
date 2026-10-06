import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminLayout from "../../components/AdminLayout";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/adminSession";

export default async function AdminRootLayout({ children }) {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;

  if (!verifyAdminSession(token)) {
    redirect("/login?next=/admin");
  }

  return <AdminLayout>{children}</AdminLayout>;
}
