"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Calendar,
} from "lucide-react";

import { adminApi } from "@/lib/adminApi";

const initialCustomers = [
  {
    id: "KH001",
    name: "Nguyễn Văn An",
    phone: "0901234567",
    email: "nguyenvanan@gmail.com",
    address: "Hà Nội",
    date: "02/01/2026",
    orders: 12,
    spent: 45800000,
    status: "Hoạt động",
  },
  {
    id: "KH002",
    name: "Trần Minh Đức",
    phone: "0912345678",
    email: "tranminhduc@gmail.com",
    address: "Hưng Yên",
    date: "15/01/2026",
    orders: 8,
    spent: 28500000,
    status: "Hoạt động",
  },
  {
    id: "KH003",
    name: "Lê Thị Hương",
    phone: "0923456789",
    email: "lethihuong@gmail.com",
    address: "Hải Phòng",
    date: "21/02/2026",
    orders: 15,
    spent: 62400000,
    status: "Hoạt động",
  },
  {
    id: "KH004",
    name: "Phạm Văn Nam",
    phone: "0934567890",
    email: "phamnam@gmail.com",
    address: "Hà Nội",
    date: "08/03/2026",
    orders: 4,
    spent: 8200000,
    status: "Hoạt động",
  },
  {
    id: "KH005",
    name: "Đỗ Thị Mai",
    phone: "0945678901",
    email: "dothimai@gmail.com",
    address: "Bắc Ninh",
    date: "19/03/2026",
    orders: 7,
    spent: 15900000,
    status: "Hoạt động",
  },
  {
    id: "KH006",
    name: "Nguyễn Quốc Bảo",
    phone: "0956789012",
    email: "nguyenquocbao@gmail.com",
    address: "Hải Dương",
    date: "02/04/2026",
    orders: 2,
    spent: 1780000,
    status: "Không hoạt động",
  },
  {
    id: "KH007",
    name: "Vũ Minh Hoàng",
    phone: "0967890123",
    email: "vuminhhoang@gmail.com",
    address: "Hưng Yên",
    date: "16/04/2026",
    orders: 18,
    spent: 78500000,
    status: "Hoạt động",
  },
  {
    id: "KH008",
    name: "Ngô Thị Lan",
    phone: "0978901234",
    email: "ngothilan@gmail.com",
    address: "Hà Nội",
    date: "05/05/2026",
    orders: 5,
    spent: 9400000,
    status: "Hoạt động",
  },
];

const formatMoney = (number) =>
  new Intl.NumberFormat("vi-VN").format(number) + "đ";

export default function KhachHangPage() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  async function loadCustomers() {
    try {
      setCustomers(await adminApi.customers.list());
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    adminApi.customers.list()
      .then(setCustomers)
      .catch((error) => alert(error.message));
  }, []);

  function openAddCustomer() {
    setEditingCustomer({
      address: "Chưa có địa chỉ",
      email: "",
      id: "Khách hàng mới",
      name: "",
      password: "",
      phone: "",
      rawId: null,
      status: "Hoạt động",
    });
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        customer.id.toLowerCase().includes(keyword) ||
        customer.name.toLowerCase().includes(keyword) ||
        customer.phone.includes(keyword) ||
        customer.email.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "Tất cả" ||
        customer.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [customers, search, statusFilter]);

  const active = customers.filter(
    (c) => c.status === "Hoạt động"
  ).length;

  const inactive = customers.filter(
    (c) => c.status === "Không hoạt động"
  ).length;

  const totalSpent = customers.reduce(
    (sum, customer) => sum + customer.spent,
    0
  );

  const handleDelete = async (id) => {
    const customer = customers.find((c) => c.id === id);

    if (
      window.confirm(
        `Bạn có chắc muốn xóa khách hàng ${customer.name}?`
      )
    ) {
      try {
        await adminApi.customers.delete(customer.rawId);
        setCustomers((current) => current.filter((c) => c.id !== id));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleSave = async () => {
    if (!editingCustomer.name.trim() || !editingCustomer.email.trim()) {
      alert("Vui lòng nhập họ tên và email.");
      return;
    }
    setSaving(true);
    try {
      if (editingCustomer.rawId) {
        await adminApi.customers.update(editingCustomer.rawId, editingCustomer);
      } else {
        await adminApi.customers.create(editingCustomer);
      }
      await loadCustomers();
      setEditingCustomer(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <link rel="stylesheet" href="/css/khach-hang.css" />

      <div className="customer-management">

        <div className="customer-page-header">
          <div>
            <h1>Quản lý khách hàng</h1>
            <p>
              Quản lý thông tin và lịch sử mua hàng của khách hàng
            </p>
          </div>

          <button className="customer-primary-btn" onClick={openAddCustomer}>
            <Plus size={18} />
            Thêm khách hàng
          </button>
        </div>

        <div className="customer-stat-grid">

          <div className="customer-stat-card">
            <div className="customer-stat-icon total">
              <User size={22} />
            </div>
            <div>
              <span>Tổng khách hàng</span>
              <strong>{customers.length}</strong>
            </div>
          </div>

          <div className="customer-stat-card">
            <div className="customer-stat-icon active">
              <User size={22} />
            </div>
            <div>
              <span>Đang hoạt động</span>
              <strong>{active}</strong>
            </div>
          </div>

          <div className="customer-stat-card">
            <div className="customer-stat-icon inactive">
              <User size={22} />
            </div>
            <div>
              <span>Không hoạt động</span>
              <strong>{inactive}</strong>
            </div>
          </div>

          <div className="customer-stat-card">
            <div className="customer-stat-icon money">
              <ShoppingBag size={22} />
            </div>
            <div>
              <span>Tổng doanh thu</span>
              <strong>{formatMoney(totalSpent)}</strong>
            </div>
          </div>

        </div>

        <div className="customer-table-card">

          <div className="customer-toolbar">

            <div className="customer-search">
              <Search size={19} />
              <input
                placeholder="Tìm tên, mã KH, SĐT, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="customer-filter"
            >
              <option>Tất cả</option>
              <option>Hoạt động</option>
              <option>Không hoạt động</option>
            </select>

          </div>

          <div className="customer-table-wrapper">

            <table className="customer-table">

              <thead>
                <tr>
                  <th>Mã KH</th>
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Địa chỉ</th>
                  <th>Số đơn</th>
                  <th>Tổng chi tiêu</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>

                {filteredCustomers.map((customer) => (

                  <tr key={customer.id}>

                    <td>
                      <span className="customer-code">
                        {customer.id}
                      </span>
                    </td>

                    <td>
                      <div className="customer-name">
                        <div className="customer-avatar">
                          {customer.name.charAt(0)}
                        </div>

                        <div>
                          <strong>{customer.name}</strong>
                          <small>
                            Tham gia {customer.date}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="customer-contact">
                        <span>{customer.phone}</span>
                        <small>{customer.email}</small>
                      </div>
                    </td>

                    <td>{customer.address}</td>

                    <td>
                      <strong>{customer.orders}</strong>
                    </td>

                    <td>
                      <strong className="customer-money">
                        {formatMoney(customer.spent)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={
                          customer.status === "Hoạt động"
                            ? "customer-status active"
                            : "customer-status inactive"
                        }
                      >
                        {customer.status}
                      </span>
                    </td>

                    <td>
                      <div className="customer-actions">

                        <button
                          className="customer-action view"
                          onClick={() =>
                            setSelectedCustomer(customer)
                          }
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          className="customer-action edit"
                          onClick={() =>
                            setEditingCustomer(customer)
                          }
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="customer-action delete"
                          onClick={() =>
                            handleDelete(customer.id)
                          }
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          <div className="customer-footer">
            Hiển thị <strong>{filteredCustomers.length}</strong>{" "}
            / {customers.length} khách hàng
          </div>

        </div>

        {/* DETAIL */}
        {selectedCustomer && (
          <div
            className="customer-modal-overlay"
            onClick={() => setSelectedCustomer(null)}
          >
            <div
              className="customer-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="customer-modal-header">
                <div>
                  <h2>Thông tin khách hàng</h2>
                  <span>{selectedCustomer.id}</span>
                </div>

                <button
                  onClick={() =>
                    setSelectedCustomer(null)
                  }
                >
                  <X size={20} />
                </button>
              </div>

              <div className="customer-detail-profile">

                <div className="customer-big-avatar">
                  {selectedCustomer.name.charAt(0)}
                </div>

                <h3>{selectedCustomer.name}</h3>

                <span
                  className={
                    selectedCustomer.status === "Hoạt động"
                      ? "customer-status active"
                      : "customer-status inactive"
                  }
                >
                  {selectedCustomer.status}
                </span>

              </div>

              <div className="customer-detail-grid">

                <div>
                  <Phone size={18} />
                  <span>Số điện thoại</span>
                  <strong>
                    {selectedCustomer.phone}
                  </strong>
                </div>

                <div>
                  <Mail size={18} />
                  <span>Email</span>
                  <strong>
                    {selectedCustomer.email}
                  </strong>
                </div>

                <div>
                  <MapPin size={18} />
                  <span>Địa chỉ</span>
                  <strong>
                    {selectedCustomer.address}
                  </strong>
                </div>

                <div>
                  <Calendar size={18} />
                  <span>Ngày tham gia</span>
                  <strong>
                    {selectedCustomer.date}
                  </strong>
                </div>

              </div>

              <div className="customer-summary">

                <div>
                  <span>Số đơn hàng</span>
                  <strong>
                    {selectedCustomer.orders}
                  </strong>
                </div>

                <div>
                  <span>Tổng chi tiêu</span>
                  <strong>
                    {formatMoney(
                      selectedCustomer.spent
                    )}
                  </strong>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* EDIT */}
        {editingCustomer && (
          <div
            className="customer-modal-overlay"
            onClick={() => setEditingCustomer(null)}
          >
            <div
              className="customer-edit-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="customer-modal-header">
                <div>
                  <h2>{editingCustomer.rawId ? "Chỉnh sửa khách hàng" : "Thêm khách hàng"}</h2>
                  <span>{editingCustomer.id}</span>
                </div>

                <button
                  onClick={() =>
                    setEditingCustomer(null)
                  }
                >
                  <X size={20} />
                </button>
              </div>

              <div className="customer-form">

                <label>Họ và tên</label>
                <input
                  value={editingCustomer.name}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      name: e.target.value,
                    })
                  }
                />

                <label>Số điện thoại</label>
                <input
                  value={editingCustomer.phone}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      phone: e.target.value,
                    })
                  }
                />

                <label>Email</label>
                <input
                  value={editingCustomer.email}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      email: e.target.value,
                    })
                  }
                />

                <label>Địa chỉ</label>
                <input
                  value={editingCustomer.address}
                  disabled
                />

                {!editingCustomer.rawId && (
                  <>
                    <label>Mật khẩu</label>
                    <input
                      type="password"
                      value={editingCustomer.password}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, password: e.target.value })}
                      placeholder="Ít nhất 6 ký tự"
                    />
                  </>
                )}

                <label>Trạng thái</label>
                <select
                  value={editingCustomer.status}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      status: e.target.value,
                    })
                  }
                >
                  <option>Hoạt động</option>
                  <option>Không hoạt động</option>
                </select>

              </div>

              <div className="customer-form-actions">

                <button
                  className="customer-cancel-btn"
                  onClick={() =>
                    setEditingCustomer(null)
                  }
                >
                  Hủy
                </button>

                <button
                  className="customer-primary-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : editingCustomer.rawId ? "Lưu thay đổi" : "Thêm khách hàng"}
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}
