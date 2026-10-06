"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingBag,
  User,
  Phone,
  MapPin,
  CreditCard,
} from "lucide-react";

import { adminApi } from "@/lib/adminApi";


const formatMoney = (number) => {
  return new Intl.NumberFormat("vi-VN").format(number) + "đ";
};

export default function DonHangPage() {
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  async function loadOrders() {
    try {
      setOrders(await adminApi.orders.list());
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    let active = true;
    let loading = false;
    async function refreshOrders(showError = false) {
      if (loading) return;
      loading = true;
      try {
        const nextOrders = await adminApi.orders.list();
        if (active) setOrders(nextOrders);
      } catch (error) {
        if (active && showError) alert(error.message);
      } finally {
        loading = false;
      }
    }
    void refreshOrders(true);
    const refreshVisibleOrders = () => {
      if (document.visibilityState === "visible") void refreshOrders();
    };
    const interval = setInterval(refreshVisibleOrders, 5000);
    window.addEventListener("focus", refreshVisibleOrders);
    document.addEventListener("visibilitychange", refreshVisibleOrders);
    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", refreshVisibleOrders);
      document.removeEventListener("visibilitychange", refreshVisibleOrders);
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(
        (order) => order.status === "Chờ xác nhận"
      ).length,
      shipping: orders.filter(
        (order) => order.status === "Đang giao"
      ).length,
      completed: orders.filter(
        (order) => order.status === "Đã giao"
      ).length,
      cancelled: orders.filter(
        (order) => order.status === "Đã hủy"
      ).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = search.toLowerCase().trim();

      const matchSearch =
        order.id.toLowerCase().includes(keyword) ||
        order.customer.toLowerCase().includes(keyword) ||
        order.phone.includes(keyword);

      const matchStatus =
        statusFilter === "Tất cả" ||
        order.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const handleDelete = async (id) => {
    const order = orders.find((item) => item.id === id);

    if (!order) return;

    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa đơn hàng ${order.id}?`
    );

    if (!confirmDelete) return;

    try {
      await adminApi.orders.delete(order.rawId);
      setOrders((current) => current.filter((item) => item.id !== id));
      if (selectedOrder?.id === id) setSelectedOrder(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateStatus = async () => {
    if (!editingOrder) return;

    setSaving(true);
    try {
      await adminApi.orders.updateStatus(editingOrder.rawId, editingOrder.status);
      await loadOrders();
      setSelectedOrder((current) => current ? { ...current, status: editingOrder.status } : current);
      setEditingOrder(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Chờ xác nhận":
        return "order-status pending";

      case "Đang giao":
        return "order-status shipping";

      case "Đã giao":
        return "order-status completed";

      case "Đã hủy":
        return "order-status cancelled";

      default:
        return "order-status";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Chờ xác nhận":
        return <Clock size={15} />;

      case "Đang giao":
        return <Truck size={15} />;

      case "Đã giao":
        return <CheckCircle size={15} />;

      case "Đã hủy":
        return <XCircle size={15} />;

      default:
        return <Package size={15} />;
    }
  };

  return (
    <>
      <link rel="stylesheet" href="/css/don-hang.css" />

      <div className="order-management">

        {/* HEADER */}
        <div className="order-page-header">
          <div>
            <h1>Quản lý đơn hàng</h1>
            <p>
              Theo dõi và quản lý tất cả đơn hàng của cửa hàng
            </p>
          </div>

          <button className="order-primary-btn">
            <Plus size={18} />
            Tạo đơn hàng
          </button>
        </div>

        {/* STATISTICS */}
        <div className="order-stat-grid">

          <div className="order-stat-card">
            <div className="order-stat-icon total">
              <ShoppingBag size={22} />
            </div>

            <div>
              <span>Tổng đơn hàng</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="order-stat-icon pending">
              <Clock size={22} />
            </div>

            <div>
              <span>Chờ xác nhận</span>
              <strong>{stats.pending}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="order-stat-icon shipping">
              <Truck size={22} />
            </div>

            <div>
              <span>Đang giao</span>
              <strong>{stats.shipping}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="order-stat-icon completed">
              <CheckCircle size={22} />
            </div>

            <div>
              <span>Đã giao</span>
              <strong>{stats.completed}</strong>
            </div>
          </div>

          <div className="order-stat-card">
            <div className="order-stat-icon cancelled">
              <XCircle size={22} />
            </div>

            <div>
              <span>Đã hủy</span>
              <strong>{stats.cancelled}</strong>
            </div>
          </div>

        </div>

        {/* TABLE CARD */}
        <div className="order-table-card">

          {/* TOOLBAR */}
          <div className="order-toolbar">

            <div className="order-search">
              <Search size={19} />

              <input
                type="text"
                placeholder="Tìm mã đơn, khách hàng, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="order-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option>Tất cả</option>
              <option>Chờ xác nhận</option>
              <option>Đang giao</option>
              <option>Đã giao</option>
              <option>Đã hủy</option>
            </select>

          </div>

          {/* TABLE */}
          <div className="order-table-wrapper">

            <table className="order-table">

              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Số sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>

                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="order-empty"
                    >
                      Không tìm thấy đơn hàng
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (

                    <tr key={order.id}>

                      <td>
                        <span className="order-code">
                          {order.id}
                        </span>
                      </td>

                      <td>
                        <div className="order-customer">
                          <div className="customer-avatar">
                            {order.customer
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {order.customer}
                            </strong>

                            <small>
                              {order.phone}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{order.date}</td>

                      <td>
                        {order.items.reduce(
                          (sum, item) =>
                            sum + item.quantity,
                          0
                        )}
                      </td>

                      <td>
                        <strong className="order-price">
                          {formatMoney(order.total)}
                        </strong>
                      </td>

                      <td>
                        <span className="payment-type">
                          {order.payment}
                        </span>
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            order.status
                          )}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>

                      <td>

                        <div className="order-actions">

                          <button
                            className="order-action view"
                            title="Xem chi tiết"
                            onClick={() =>
                              setSelectedOrder(order)
                            }
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            className="order-action edit"
                            title="Cập nhật trạng thái"
                            onClick={() =>
                              setEditingOrder(order)
                            }
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            className="order-action delete"
                            title="Xóa"
                            onClick={() =>
                              handleDelete(order.id)
                            }
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))
                )}

              </tbody>

            </table>

          </div>

          {/* FOOTER */}
          <div className="order-table-footer">
            <span>
              Hiển thị{" "}
              <strong>{filteredOrders.length}</strong>{" "}
              / {orders.length} đơn hàng
            </span>

            <div className="order-pagination">
              <button disabled>‹</button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <button>›</button>
            </div>
          </div>

        </div>

        {/* DETAIL MODAL */}
        {selectedOrder && (
          <div
            className="order-modal-overlay"
            onClick={() => setSelectedOrder(null)}
          >

            <div
              className="order-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="order-modal-header">

                <div>
                  <h2>
                    Chi tiết đơn hàng
                  </h2>

                  <span>
                    {selectedOrder.id}
                  </span>
                </div>

                <button
                  onClick={() =>
                    setSelectedOrder(null)
                  }
                >
                  <X size={20} />
                </button>

              </div>

              {/* CUSTOMER INFO */}
              <div className="order-detail-section">

                <h3>Thông tin khách hàng</h3>

                <div className="order-info-grid">

                  <div className="order-info-item">
                    <User size={18} />

                    <div>
                      <span>Khách hàng</span>
                      <strong>
                        {selectedOrder.customer}
                      </strong>
                    </div>
                  </div>

                  <div className="order-info-item">
                    <Phone size={18} />

                    <div>
                      <span>Số điện thoại</span>
                      <strong>
                        {selectedOrder.phone}
                      </strong>
                    </div>
                  </div>

                  <div className="order-info-item">
                    <MapPin size={18} />

                    <div>
                      <span>Địa chỉ</span>
                      <strong>
                        {selectedOrder.address}
                      </strong>
                    </div>
                  </div>

                  <div className="order-info-item">
                    <CreditCard size={18} />

                    <div>
                      <span>Thanh toán</span>
                      <strong>
                        {selectedOrder.payment}
                      </strong>
                    </div>
                  </div>

                </div>

              </div>

              {/* PRODUCTS */}
              <div className="order-detail-section">

                <h3>Sản phẩm</h3>

                <div className="detail-products">

                  {selectedOrder.items.map(
                    (item, index) => (

                      <div
                        className="detail-product"
                        key={index}
                      >

                        <div className="detail-product-icon">
                          <Package size={21} />
                        </div>

                        <div className="detail-product-info">
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {[
                              item.size ? `Size ${item.size}` : "",
                              item.color,
                            ].filter(Boolean).join(" · ")}
                            {item.size || item.color ? " · " : ""}SL: {item.quantity}
                          </span>
                        </div>

                        <strong>
                          {formatMoney(
                            item.price *
                              item.quantity
                          )}
                        </strong>

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* TOTAL */}
              <div className="order-detail-total">

                <span>Tổng thanh toán</span>

                <strong>
                  {formatMoney(
                    selectedOrder.total
                  )}
                </strong>

              </div>

              <div className="order-detail-status">

                <span>Trạng thái:</span>

                <span
                  className={getStatusClass(
                    selectedOrder.status
                  )}
                >
                  {getStatusIcon(
                    selectedOrder.status
                  )}
                  {selectedOrder.status}
                </span>

              </div>

            </div>

          </div>
        )}

        {/* UPDATE STATUS MODAL */}
        {editingOrder && (
          <div
            className="order-modal-overlay"
            onClick={() =>
              setEditingOrder(null)
            }
          >

            <div
              className="order-status-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="order-modal-header">

                <div>
                  <h2>
                    Cập nhật đơn hàng
                  </h2>

                  <span>
                    {editingOrder.id}
                  </span>
                </div>

                <button
                  onClick={() =>
                    setEditingOrder(null)
                  }
                >
                  <X size={20} />
                </button>

              </div>

              <div className="status-form">

                <label>
                  Trạng thái đơn hàng
                </label>

                <select
                  value={editingOrder.status}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      status: e.target.value,
                    })
                  }
                >
                  <option>
                    Chờ xác nhận
                  </option>

                  <option>
                    Đang giao
                  </option>

                  <option>
                    Đã giao
                  </option>

                  <option>
                    Đã hủy
                  </option>
                </select>

              </div>

              <div className="status-modal-actions">

                <button
                  className="order-cancel-btn"
                  onClick={() =>
                    setEditingOrder(null)
                  }
                >
                  Hủy
                </button>

                <button
                  className="order-primary-btn"
                  onClick={
                    handleUpdateStatus
                  }
                  disabled={saving}
                >
                  <CheckCircle size={17} />
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </>
  );
}
