"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Truck,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import { adminApi } from "@/lib/adminApi";

const initialSuppliers = [
  {
    id: "NCC001",
    name: "Công ty TNHH ELIP",
    phone: "0901234567",
    email: "elip@gmail.com",
    address: "TP. Hồ Chí Minh",
    products: 85,
    status: "Đang hợp tác",
  },
  {
    id: "NCC002",
    name: "Công ty Thể Thao Việt",
    phone: "0912345678",
    email: "thethaoviet@gmail.com",
    address: "Hà Nội",
    products: 56,
    status: "Đang hợp tác",
  },
  {
    id: "NCC003",
    name: "Sport Equipment Việt Nam",
    phone: "0987654321",
    email: "sportvn@gmail.com",
    address: "Đà Nẵng",
    products: 42,
    status: "Đang hợp tác",
  },
  {
    id: "NCC004",
    name: "Fitness Việt Nam",
    phone: "0934567890",
    email: "fitnessvn@gmail.com",
    address: "Hà Nội",
    products: 38,
    status: "Đang hợp tác",
  },
  {
    id: "NCC005",
    name: "Nhà phân phối Minh Anh",
    phone: "0978123456",
    email: "minhanh@gmail.com",
    address: "Bình Dương",
    products: 25,
    status: "Tạm ngưng",
  },
  {
    id: "NCC006",
    name: "Công ty Dụng cụ Gym Việt",
    phone: "0965432109",
    email: "gymviet@gmail.com",
    address: "TP. Hồ Chí Minh",
    products: 31,
    status: "Đang hợp tác",
  },
];

export default function NhaCungCapPage() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [form, setForm] = useState({
    id: "",
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
    taxCode: "",
    status: "Đang hợp tác",
  });

  async function loadSuppliers() {
    try {
      setSuppliers(await adminApi.suppliers.list());
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    adminApi.suppliers.list()
      .then(setSuppliers)
      .catch((error) => alert(error.message));
  }, []);

  const filteredSuppliers = suppliers.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.id.toLowerCase().includes(keyword) ||
      item.name.toLowerCase().includes(keyword) ||
      item.phone.toLowerCase().includes(keyword)
    );
  });

  const totalProducts = suppliers.reduce(
    (sum, item) => sum + item.products,
    0
  );

  const activeSuppliers = suppliers.filter(
    (item) => item.status === "Đang hợp tác"
  ).length;

  const inactiveSuppliers = suppliers.filter(
    (item) => item.status === "Tạm ngưng"
  ).length;

  const openAddModal = () => {
    setEditingSupplier(null);

    setForm({
      id: `NCC${String(suppliers.length + 1).padStart(3, "0")}`,
      name: "",
      contact: "",
      phone: "",
      email: "",
      address: "",
      taxCode: "",
      status: "Đang hợp tác",
    });

    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);

    setForm({
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contact || "",
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      taxCode: supplier.taxCode || "",
      status: supplier.status,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Vui lòng nhập tên nhà cung cấp!");
      return;
    }

    if (!form.phone.trim()) {
      alert("Vui lòng nhập số điện thoại!");
      return;
    }

    setSaving(true);
    try {
      if (editingSupplier) {
        await adminApi.suppliers.update(editingSupplier.rawId, form);
      } else {
        await adminApi.suppliers.create(form);
      }
      await loadSuppliers();
      closeModal();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplier) => {
    if (supplier.products > 0) {
      alert(
        `Không thể xóa "${supplier.name}" vì nhà cung cấp này đang cung cấp ${supplier.products} sản phẩm.`
      );
      return;
    }

    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa nhà cung cấp "${supplier.name}" không?`
    );

    if (confirmDelete) {
      try {
        await adminApi.suppliers.delete(supplier.rawId);
        setSuppliers(suppliers.filter((item) => item.id !== supplier.id));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <>
      <link rel="stylesheet" href="/css/nha-cung-cap.css" />

      <div className="supplier-management">

        {/* HEADER */}
        <div className="supplier-page-header">
          <div>
            <h1>Nhà cung cấp</h1>
            <p>
              Quản lý thông tin các nhà cung cấp của Elip Sport
            </p>
          </div>

          <button
            className="supplier-add-btn"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Thêm nhà cung cấp
          </button>
        </div>

        {/* STATISTICS */}
        <div className="supplier-stat-grid">

          <div className="supplier-stat-card">
            <div className="supplier-stat-icon">
              <Truck size={22} />
            </div>

            <div>
              <span>Tổng nhà cung cấp</span>
              <strong>{suppliers.length}</strong>
            </div>
          </div>

          <div className="supplier-stat-card">
            <div className="supplier-stat-icon active">
              <Truck size={22} />
            </div>

            <div>
              <span>Đang hợp tác</span>
              <strong>{activeSuppliers}</strong>
            </div>
          </div>

          <div className="supplier-stat-card">
            <div className="supplier-stat-icon warning">
              <Truck size={22} />
            </div>

            <div>
              <span>Tạm ngưng</span>
              <strong>{inactiveSuppliers}</strong>
            </div>
          </div>

          <div className="supplier-stat-card">
            <div className="supplier-stat-icon products">
              <Truck size={22} />
            </div>

            <div>
              <span>Sản phẩm cung cấp</span>
              <strong>{totalProducts}</strong>
            </div>
          </div>

        </div>

        {/* TABLE */}
        <div className="supplier-table-card">

          <div className="supplier-toolbar">

            <div>
              <h2>Danh sách nhà cung cấp</h2>
              <p>
                {filteredSuppliers.length} nhà cung cấp
              </p>
            </div>

            <div className="supplier-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Tìm kiếm nhà cung cấp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

          </div>

          <div className="supplier-table-wrapper">

            <table className="supplier-table">

              <thead>
                <tr>
                  <th>MÃ NCC</th>
                  <th>NHÀ CUNG CẤP</th>
                  <th>LIÊN HỆ</th>
                  <th>ĐỊA CHỈ</th>
                  <th>SẢN PHẨM</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>

              <tbody>

                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id}>

                      <td>
                        <span className="supplier-code">
                          {supplier.id}
                        </span>
                      </td>

                      <td>
                        <div className="supplier-name">
                          <div className="supplier-avatar">
                            {supplier.name.charAt(0)}
                          </div>

                          <strong>{supplier.name}</strong>
                        </div>
                      </td>

                      <td>
                        <div className="supplier-contact">

                          <div>
                            <Phone size={13} />
                            <span>{supplier.phone}</span>
                          </div>

                          <div>
                            <Mail size={13} />
                            <span>{supplier.email}</span>
                          </div>

                        </div>
                      </td>

                      <td>
                        <div className="supplier-address">
                          <MapPin size={14} />
                          <span>{supplier.address}</span>
                        </div>
                      </td>

                      <td>
                        <span className="supplier-product-count">
                          {supplier.products}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            supplier.status === "Đang hợp tác"
                              ? "supplier-status active"
                              : "supplier-status inactive"
                          }
                        >
                          {supplier.status}
                        </span>
                      </td>

                      <td>
                        <div className="supplier-actions">

                          <button
                            className="supplier-action edit"
                            onClick={() =>
                              openEditModal(supplier)
                            }
                            title="Sửa"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="supplier-action delete"
                            onClick={() =>
                              handleDelete(supplier)
                            }
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="supplier-empty"
                    >
                      Không tìm thấy nhà cung cấp
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

          {/* FOOTER */}
          <div className="supplier-table-footer">

            <span>
              Hiển thị {filteredSuppliers.length} /{" "}
              {suppliers.length} nhà cung cấp
            </span>

            <div className="supplier-pagination">
              <button disabled>‹</button>
              <button className="active">1</button>
              <button disabled>›</button>
            </div>

          </div>

        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="supplier-modal-overlay">

          <div className="supplier-modal">

            <div className="supplier-modal-header">

              <div>
                <h2>
                  {editingSupplier
                    ? "Chỉnh sửa nhà cung cấp"
                    : "Thêm nhà cung cấp"}
                </h2>

                <p>
                  {editingSupplier
                    ? "Cập nhật thông tin nhà cung cấp"
                    : "Nhập thông tin nhà cung cấp mới"}
                </p>
              </div>

              <button
                className="supplier-modal-close"
                onClick={closeModal}
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="supplier-form"
              onSubmit={handleSubmit}
            >

              <div className="supplier-form-row">

                <div className="supplier-form-group">
                  <label>Mã nhà cung cấp</label>

                  <input
                    type="text"
                    name="id"
                    value={form.id}
                    disabled
                  />
                </div>

                <div className="supplier-form-group">
                  <label>
                    Tên nhà cung cấp <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nhập tên nhà cung cấp"
                  />
                </div>

              </div>

              <div className="supplier-form-row">

                <div className="supplier-form-group">
                  <label>
                    Số điện thoại <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="supplier-form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Nhập email"
                  />
                </div>

              </div>

              <div className="supplier-form-group">
                <label>Địa chỉ</label>

                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ nhà cung cấp"
                />
              </div>

              <div className="supplier-form-group">
                <label>Trạng thái</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Đang hợp tác">
                    Đang hợp tác
                  </option>

                  <option value="Tạm ngưng">
                    Tạm ngưng
                  </option>
                </select>
              </div>

              <div className="supplier-modal-footer">

                <button
                  type="button"
                  className="supplier-btn-cancel"
                  onClick={closeModal}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="supplier-btn-save"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editingSupplier
                    ? "Cập nhật"
                    : "Thêm nhà cung cấp"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </>
  );
}
