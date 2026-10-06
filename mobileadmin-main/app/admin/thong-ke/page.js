"use client";

import { useEffect, useState } from "react";

import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

import { adminApi } from "@/lib/adminApi";

const initialRevenueData = [
  { day: "04/09", value: 125 },
  { day: "05/09", value: 185 },
  { day: "06/09", value: 148 },
  { day: "07/09", value: 235 },
  { day: "08/09", value: 198 },
  { day: "09/09", value: 285 },
  { day: "10/09", value: 320 },
];

const initialTopProducts = [
  {
    name: "Máy chạy bộ ELIP Platin",
    category: "Máy chạy bộ",
    quantity: 46,
    revenue: 869400000,
  },
  {
    name: "Xe đạp tập ELIP",
    category: "Xe đạp tập",
    quantity: 38,
    revenue: 285000000,
  },
  {
    name: "Ghế tập tạ đa năng",
    category: "Dụng cụ tập",
    quantity: 32,
    revenue: 134400000,
  },
  {
    name: "Tạ tay 10kg",
    category: "Tạ",
    quantity: 86,
    revenue: 55900000,
  },
  {
    name: "Thảm Yoga cao cấp",
    category: "Yoga",
    quantity: 74,
    revenue: 33300000,
  },
];

const initialCategories = [
  {
    name: "Máy chạy bộ",
    revenue: 925000000,
    percent: 42,
  },
  {
    name: "Xe đạp tập",
    revenue: 485000000,
    percent: 22,
  },
  {
    name: "Dụng cụ tập",
    revenue: 352000000,
    percent: 16,
  },
  {
    name: "Tạ",
    revenue: 265000000,
    percent: 12,
  },
  {
    name: "Yoga",
    revenue: 176000000,
    percent: 8,
  },
];

const formatMoney = (number) =>
  new Intl.NumberFormat("vi-VN").format(number) + "đ";

export default function ThongKePage() {
  const [revenueData, setRevenueData] = useState(initialRevenueData);
  const [topProducts, setTopProducts] = useState(initialTopProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [overview, setOverview] = useState({ customers: 0, orders: 0, productsSold: 0, revenue: 0 });
  const [orderStatuses, setOrderStatuses] = useState([]);

  useEffect(() => {
    adminApi.statistics()
      .then((data) => {
        setOverview({
          customers: Number(data.overview.customers) || 0,
          orders: Number(data.overview.orders) || 0,
          productsSold: Number(data.overview.productsSold) || 0,
          revenue: Number(data.overview.revenue) || 0,
        });
        setRevenueData((data.dailyRevenue || []).map((item) => ({
          day: new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(new Date(item.day)),
          value: Math.round((Number(item.revenue) || 0) / 1_000_000),
        })));
        setTopProducts((data.topProducts || []).map((item) => ({
          category: item.category || "Chưa phân loại",
          name: item.name,
          quantity: Number(item.quantity) || 0,
          revenue: Number(item.revenue) || 0,
        })));
        const categoryRows = data.categories || [];
        const categoryRevenue = categoryRows.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0);
        setCategories(categoryRows.map((item) => ({
          name: item.name,
          percent: categoryRevenue ? Math.round(((Number(item.revenue) || 0) / categoryRevenue) * 100) : 0,
          revenue: Number(item.revenue) || 0,
        })));
        setOrderStatuses(data.orderStatuses || []);
      })
      .catch((error) => alert(error.message));
  }, []);

  const maxRevenue = Math.max(
    ...revenueData.map((item) => item.value),
    1
  );
  const statusCount = (status) => Number(orderStatuses.find((item) => item.status === status)?.total) || 0;
  const totalOrders = orderStatuses.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  return (
    <>
      <link rel="stylesheet" href="/css/thong-ke.css" />

      <div className="statistics-management">

        <div className="statistics-page-header">

          <div>
            <h1>Thống kê & báo cáo</h1>
            <p>
              Theo dõi tình hình kinh doanh và hoạt động của cửa hàng
            </p>
          </div>

          <button className="statistics-date-btn">
            <CalendarDays size={17} />
            7 ngày gần nhất
          </button>

        </div>

        {/* OVERVIEW */}

        <div className="statistics-stat-grid">

          <div className="statistics-stat-card">

            <div className="statistics-stat-icon revenue">
              <TrendingUp size={22} />
            </div>

            <div className="statistics-stat-content">
              <span>Doanh thu</span>
              <strong>{formatMoney(overview.revenue)}</strong>

              <small className="up">
                <ArrowUpRight size={14} />
                12,8% so với kỳ trước
              </small>
            </div>

          </div>

          <div className="statistics-stat-card">

            <div className="statistics-stat-icon order">
              <ShoppingBag size={22} />
            </div>

            <div className="statistics-stat-content">
              <span>Đơn hàng</span>
              <strong>{new Intl.NumberFormat("vi-VN").format(overview.orders)}</strong>

              <small className="up">
                <ArrowUpRight size={14} />
                8,4% so với kỳ trước
              </small>
            </div>

          </div>

          <div className="statistics-stat-card">

            <div className="statistics-stat-icon product">
              <Package size={22} />
            </div>

            <div className="statistics-stat-content">
              <span>Sản phẩm bán ra</span>
              <strong>{new Intl.NumberFormat("vi-VN").format(overview.productsSold)}</strong>

              <small className="up">
                <ArrowUpRight size={14} />
                15,2% so với kỳ trước
              </small>
            </div>

          </div>

          <div className="statistics-stat-card">

            <div className="statistics-stat-icon customer">
              <Users size={22} />
            </div>

            <div className="statistics-stat-content">
              <span>Khách hàng</span>
              <strong>{new Intl.NumberFormat("vi-VN").format(overview.customers)}</strong>

              <small className="up">
                <ArrowUpRight size={14} />
                10,5% so với kỳ trước
              </small>
            </div>

          </div>

        </div>

        {/* CHART ROW */}

        <div className="statistics-chart-grid">

          {/* REVENUE CHART */}

          <div className="statistics-card revenue-card">

            <div className="statistics-card-header">

              <div>
                <h2>Doanh thu theo ngày</h2>
                <p>Đơn vị: triệu đồng</p>
              </div>

              <div className="statistics-total-revenue">
                <strong>{Math.round(overview.revenue / 1_000_000)} triệu</strong>
                <span>
                  <ArrowUpRight size={13} />
                  12,8%
                </span>
              </div>

            </div>

            <div className="revenue-chart">

              <div className="revenue-y-axis">
                <span>350</span>
                <span>300</span>
                <span>250</span>
                <span>200</span>
                <span>150</span>
                <span>100</span>
                <span>0</span>
              </div>

              <div className="revenue-chart-area">

                <div className="revenue-grid-lines">
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </div>

                <div className="revenue-bars">

                  {revenueData.map((item) => {

                    const height =
                      (item.value / maxRevenue) * 100;

                    return (
                      <div
                        className="revenue-bar-column"
                        key={item.day}
                      >

                        <div
                          className="revenue-bar"
                          style={{
                            height: `${height}%`,
                          }}
                        >
                          <span>
                            {item.value}
                          </span>
                        </div>

                        <small>
                          {item.day}
                        </small>

                      </div>
                    );
                  })}

                </div>

              </div>

            </div>

          </div>

          {/* ORDER STATUS */}

          <div className="statistics-card status-card">

            <div className="statistics-card-header">
              <div>
                <h2>Trạng thái đơn hàng</h2>
                <p>Tổng cộng {new Intl.NumberFormat("vi-VN").format(totalOrders)} đơn hàng</p>
              </div>
            </div>

            <div className="order-donut">

              <div className="donut">
                <div className="donut-center">
                  <strong>{new Intl.NumberFormat("vi-VN").format(totalOrders)}</strong>
                  <span>Đơn hàng</span>
                </div>
              </div>

            </div>

            <div className="order-status-list">

              <div>
                <span>
                  <i className="dot pending"></i>
                  Chờ xác nhận
                </span>
                <strong>{statusCount("pending") + statusCount("confirmed")}</strong>
              </div>

              <div>
                <span>
                  <i className="dot shipping"></i>
                  Đang giao
                </span>
                <strong>{statusCount("shipping")}</strong>
              </div>

              <div>
                <span>
                  <i className="dot completed"></i>
                  Đã giao
                </span>
                <strong>{statusCount("completed")}</strong>
              </div>

              <div>
                <span>
                  <i className="dot cancelled"></i>
                  Đã hủy
                </span>
                <strong>{statusCount("cancelled")}</strong>
              </div>

            </div>

          </div>

        </div>

        {/* BOTTOM */}

        <div className="statistics-bottom-grid">

          {/* TOP PRODUCTS */}

          <div className="statistics-card">

            <div className="statistics-card-header">

              <div>
                <h2>Sản phẩm bán chạy</h2>
                <p>Top sản phẩm theo số lượng bán</p>
              </div>

            </div>

            <div className="top-products">

              {topProducts.map((product, index) => (

                <div
                  className="top-product"
                  key={product.name}
                >

                  <div className="product-rank">
                    {index + 1}
                  </div>

                  <div className="top-product-info">

                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      {product.category}
                    </span>

                  </div>

                  <div className="top-product-quantity">
                    <strong>
                      {product.quantity}
                    </strong>

                    <span>sp</span>
                  </div>

                  <div className="top-product-revenue">
                    {formatMoney(product.revenue)}
                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* CATEGORY */}

          <div className="statistics-card">

            <div className="statistics-card-header">

              <div>
                <h2>Doanh thu theo danh mục</h2>
                <p>Phân bổ doanh thu sản phẩm</p>
              </div>

            </div>

            <div className="category-statistics">

              {categories.map((category) => (

                <div
                  className="category-stat"
                  key={category.name}
                >

                  <div className="category-stat-header">

                    <span>
                      {category.name}
                    </span>

                    <strong>
                      {formatMoney(
                        category.revenue
                      )}
                    </strong>

                  </div>

                  <div className="category-progress">

                    <div
                      style={{
                        width: `${category.percent}%`,
                      }}
                    ></div>

                  </div>

                  <small>
                    {category.percent}% doanh thu
                  </small>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>
    </>
  );
}
