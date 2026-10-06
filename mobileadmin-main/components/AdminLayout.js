"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ClipboardList,
  ShoppingCart,
  TicketPercent,
  Users,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
} from "lucide-react";

const menuItems = [
  {
    name: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Sản phẩm",
    href: "/admin/san-pham",
    icon: Package,
  },
  {
    name: "Loại sản phẩm",
    href: "/admin/loai-san-pham",
    icon: Tags,
  },
  {
    name: "Nhà cung cấp",
    href: "/admin/nha-cung-cap",
    icon: Truck,
  },
  {
    name: "Nhập hàng",
    href: "/admin/nhap-hang",
    icon: ClipboardList,
  },
  {
    name: "Đơn hàng",
    href: "/admin/don-hang",
    icon: ShoppingCart,
  },
  {
    name: "Voucher",
    href: "/admin/voucher",
    icon: TicketPercent,
  },
  {
    name: "Khách hàng",
    href: "/admin/khach-hang",
    icon: Users,
  },
  {
    name: "Tài khoản",
    href: "/admin/tai-khoan",
    icon: UserCog,
  },
  {
    name: "Thống kê",
    href: "/admin/thong-ke",
    icon: BarChart3,
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <>
      <link rel="stylesheet" href="/css/admin.css" />
      <div className="admin-container">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="logo-area">
            <div className="logo">E</div>

            <div>
              <h2>ELIP SPORT</h2>
              <span>ADMIN PANEL</span>
            </div>
          </div>

          <div className="menu-label">QUẢN LÝ</div>

          <nav className="sidebar-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive ? "sidebar-link active" : "sidebar-link"}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <Link href="#" className="sidebar-link">
              <Settings size={20} />
              <span>Cài đặt</span>
            </Link>

            <Link href="/api/admin/logout" className="sidebar-link logout">
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </Link>
          </div>
        </aside>

        {/* CONTENT */}
        <div className="admin-main">
          {/* HEADER */}
          <header className="admin-header">
            <div className="search-box">
              <Search size={19} />

              <input type="text" placeholder="Tìm kiếm..." />
            </div>

            <div className="header-right">
              <button className="notification-btn">
                <Bell size={21} />

                <span className="notification-dot"></span>
              </button>

              <div className="admin-user">
                <div className="admin-avatar">A</div>

                <div>
                  <strong>Admin</strong>
                  <small>Quản trị viên</small>
                </div>
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="admin-content">{children}</main>
        </div>
      </div>
    </>
  );
}
