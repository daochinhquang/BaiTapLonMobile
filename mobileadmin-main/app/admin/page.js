"use client";

import { useEffect, useMemo, useState } from "react";

import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";

import { adminApi } from "@/lib/adminApi";

const initialOrders = [
  {
    id: "#DH00125",
    customer: "Nguyễn Văn Nam",
    date: "09/09/2026",
    total: "2.450.000đ",
    status: "Đã giao",
  },
  {
    id: "#DH00124",
    customer: "Trần Minh Anh",
    date: "09/09/2026",
    total: "1.890.000đ",
    status: "Đang giao",
  },
  {
    id: "#DH00123",
    customer: "Lê Hoàng Long",
    date: "08/09/2026",
    total: "3.250.000đ",
    status: "Chờ xử lý",
  },
  {
    id: "#DH00122",
    customer: "Phạm Quốc Huy",
    date: "08/09/2026",
    total: "950.000đ",
    status: "Đã giao",
  },
];

const initialProducts = [
  {
    name: "Máy chạy bộ Elip",
    category: "Máy tập",
    sold: 128,
  },
  {
    name: "Xe đạp tập thể dục",
    category: "Xe đạp",
    sold: 96,
  },
  {
    name: "Ghế tập tạ đa năng",
    category: "Dụng cụ tập",
    sold: 75,
  },
  {
    name: "Tạ tay 10kg",
    category: "Tạ",
    sold: 64,
  },
];

export default function AdminDashboard() {
  const [summary, setSummary] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    adminApi.dashboard()
      .then((data) => {
        setSummary({
          customers: Number(data.summary.customers) || 0,
          orders: Number(data.summary.orders) || 0,
          products: Number(data.summary.products) || 0,
          revenue: Number(data.summary.revenue) || 0,
        });
        setMonthlyRevenue(data.monthlyRevenue || []);
        setOrderStatuses(data.orderStatuses || []);
        setOrders((data.recentOrders || []).map((item) => ({
          customer: item.customer,
          date: new Intl.DateTimeFormat("vi-VN").format(new Date(item.createdAt)),
          id: `DH${String(item.id).padStart(3, "0")}`,
          status: item.status === "completed" ? "Đã giao" : item.status === "shipping" ? "Đang giao" : item.status === "cancelled" ? "Đã hủy" : "Chờ xử lý",
          total: `${new Intl.NumberFormat("vi-VN").format(Number(item.total) || 0)}đ`,
        })));
        setProducts((data.topProducts || []).map((item) => ({
          category: item.category || "Chưa phân loại",
          name: item.name,
          sold: Number(item.sold) || 0,
        })));
      })
      .catch((error) => alert(error.message));
  }, []);

  const chartHeights = useMemo(() => {
    const values = Array.from({ length: 12 }, (_, index) => {
      const item = monthlyRevenue.find((entry) => Number(entry.month) === index + 1);
      return Number(item?.revenue) || 0;
    });
    const max = Math.max(...values, 1);
    return values.map((value) => Math.max(value > 0 ? 8 : 2, Math.round((value / max) * 100)));
  }, [monthlyRevenue]);

  const statusCount = (status) => Number(orderStatuses.find((item) => item.status === status)?.total) || 0;
  const statusPercent = (value) => summary.orders ? `${((value / summary.orders) * 100).toFixed(1)}%` : "0%";
  const delivered = statusCount("completed");
  const shipping = statusCount("shipping");
  const pending = statusCount("pending") + statusCount("confirmed");
  const cancelled = statusCount("cancelled");
  const formatMoney = (value) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

  return (
    <div>

      {/* PAGE TITLE */}
      <div className="page-title">

        <div>
          <h1>Tổng quan</h1>

          <p>
            Chào mừng bạn quay lại hệ thống quản trị Elip Sport.
          </p>
        </div>

        <a className="primary-btn" href="/admin/don-hang">Xem đơn hàng</a>

      </div>


      {/* STATISTICS */}
      <div className="stats-grid">

        <StatCard
          title="Tổng doanh thu"
          value={formatMoney(summary.revenue)}
          percent="Dữ liệu thực tế"
          icon={<DollarSign />}
          type="green"
        />

        <StatCard
          title="Tổng đơn hàng"
          value={new Intl.NumberFormat("vi-VN").format(summary.orders)}
          percent="Toàn hệ thống"
          icon={<ShoppingCart />}
          type="blue"
        />

        <StatCard
          title="Sản phẩm"
          value={new Intl.NumberFormat("vi-VN").format(summary.products)}
          percent="Đang kinh doanh"
          icon={<Package />}
          type="orange"
        />

        <StatCard
          title="Khách hàng"
          value={new Intl.NumberFormat("vi-VN").format(summary.customers)}
          percent="Tài khoản khách"
          icon={<Users />}
          type="purple"
        />

      </div>


      {/* CHART */}
      <div className="dashboard-grid">

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h3>Doanh thu</h3>

              <p>
                Doanh thu theo tháng
              </p>
            </div>

            <select>
              <option>12 tháng</option>
              <option>6 tháng</option>
              <option>30 ngày</option>
            </select>

          </div>


          <div className="revenue-number">
            {formatMoney(summary.revenue)}
          </div>


          <div className="revenue-change">
            <TrendingUp size={15} />
            Tổng doanh thu đơn đã giao
          </div>


          <div className="chart">

            <div className="chart-lines">

              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>

            </div>

            <div className="chart-bars">

              {chartHeights.map(
                (height, index) => (
                  <div
                    key={index}
                    className="bar"
                    style={{
                      height: `${height}%`,
                    }}
                  ></div>
                )
              )}

            </div>

          </div>


          <div className="chart-months">

            <span>T1</span>
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span>T8</span>
            <span>T9</span>
            <span>T10</span>
            <span>T11</span>
            <span>T12</span>

          </div>

        </div>


        {/* ORDER STATUS */}
        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h3>Trạng thái đơn hàng</h3>

              <p>
                Tổng quan đơn hàng
              </p>
            </div>

            <MoreHorizontal size={20} />

          </div>


          <div className="order-total">

            <div className="order-circle">

              <strong>
                {new Intl.NumberFormat("vi-VN").format(summary.orders)}
              </strong>

              <span>
                đơn hàng
              </span>

            </div>

          </div>


          <div className="order-status-list">

            <Status
              color="green"
              name="Đã giao"
              number={delivered}
              percent={statusPercent(delivered)}
            />

            <Status
              color="yellow"
              name="Đang giao"
              number={shipping}
              percent={statusPercent(shipping)}
            />

            <Status
              color="blue"
              name="Chờ xử lý"
              number={pending}
              percent={statusPercent(pending)}
            />

            <Status
              color="red"
              name="Đã hủy"
              number={cancelled}
              percent={statusPercent(cancelled)}
            />

          </div>

        </div>

      </div>


      {/* BOTTOM */}
      <div className="bottom-grid">


        {/* RECENT ORDERS */}
        <div className="dashboard-card table-card">

          <div className="card-header">

            <div>
              <h3>
                Đơn hàng gần đây
              </h3>

              <p>
                Các đơn hàng mới nhất
              </p>
            </div>

            <a href="/admin/don-hang">
              Xem tất cả
            </a>

          </div>


          <table>

            <thead>

              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>

            </thead>


            <tbody>

              {orders.map((order) => (

                <tr key={order.id}>

                  <td>
                    <strong>
                      {order.id}
                    </strong>
                  </td>

                  <td>
                    {order.customer}
                  </td>

                  <td>
                    {order.date}
                  </td>

                  <td>
                    <strong>
                      {order.total}
                    </strong>
                  </td>

                  <td>
                    <StatusBadge
                      status={order.status}
                    />
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>


        {/* BEST PRODUCTS */}
        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h3>
                Sản phẩm bán chạy
              </h3>

              <p>
                Top sản phẩm trong tháng
              </p>
            </div>

            <a href="/admin/san-pham">
              Xem tất cả
            </a>

          </div>


          <div className="best-products">

            {products.map((product, index) => (

              <div
                className="product-item"
                key={product.name}
              >

                <div className="product-number">
                  {index + 1}
                </div>

                <div className="product-image">
                  <Package size={21} />
                </div>

                <div className="product-info">

                  <strong>
                    {product.name}
                  </strong>

                  <span>
                    {product.category}
                  </span>

                </div>

                <div className="product-sold">

                  <strong>
                    {product.sold}
                  </strong>

                  <span>
                    đã bán
                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}


/* STAT CARD */

function StatCard({
  title,
  value,
  percent,
  icon,
  type,
}) {
  return (
    <div className="stat-card">

      <div className="stat-header">

        <div className={`stat-icon ${type}`}>
          {icon}
        </div>

        <span>
          Tháng này
        </span>

      </div>

      <h2>
        {value}
      </h2>

      <div className="stat-footer">

        <span className="growth">
          <TrendingUp size={14} />
          {percent}
        </span>

        <span>
          {title}
        </span>

      </div>

    </div>
  );
}


/* STATUS */

function Status({
  color,
  name,
  number,
  percent,
}) {
  return (
    <div className="status-row">

      <span className={`status-dot ${color}`}>
      </span>

      <span className="status-name">
        {name}
      </span>

      <strong>
        {number}
      </strong>

      <small>
        {percent}
      </small>

    </div>
  );
}


/* BADGE */

function StatusBadge({ status }) {

  const classMap = {
    "Đã giao": "success",
    "Đang giao": "warning",
    "Chờ xử lý": "info",
    "Đã hủy": "danger",
  };

  return (
    <span
      className={`status-badge ${classMap[status]}`}
    >
      {status}
    </span>
  );
}
