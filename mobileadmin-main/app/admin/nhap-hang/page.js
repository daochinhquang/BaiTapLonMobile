"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  X,
  PackagePlus,
  CalendarDays,
  Truck,
  CircleDollarSign,
} from "lucide-react";

import { adminApi } from "@/lib/adminApi";

const initialImports = [
  {
    id: "PN001",
    supplier: "Công ty TNHH ELIP",
    date: "09/09/2026",
    products: 12,
    quantity: 48,
    total: 325000000,
    status: "Đã nhập",
  },
  {
    id: "PN002",
    supplier: "Công ty Thể Thao Việt",
    date: "07/09/2026",
    products: 8,
    quantity: 32,
    total: 185500000,
    status: "Đã nhập",
  },
  {
    id: "PN003",
    supplier: "Fitness Việt Nam",
    date: "05/09/2026",
    products: 6,
    quantity: 25,
    total: 96400000,
    status: "Đã nhập",
  },
  {
    id: "PN004",
    supplier: "Sport Equipment Việt Nam",
    date: "03/09/2026",
    products: 10,
    quantity: 40,
    total: 218000000,
    status: "Đã nhập",
  },
  {
    id: "PN005",
    supplier: "Nhà phân phối Minh Anh",
    date: "01/09/2026",
    products: 5,
    quantity: 18,
    total: 45200000,
    status: "Chờ nhập",
  },
];

export default function NhapHangPage() {
  const [imports, setImports] = useState(initialImports);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  const [showModal, setShowModal] = useState(false);
  const [selectedImport, setSelectedImport] = useState(null);

  const [form, setForm] = useState({
    id: "",
    supplierId: "",
    date: "",
    productId: "",
    variantId: "",
    quantity: "",
    unitPrice: "",
    status: "Chờ nhập",
  });

  async function loadData() {
    try {
      const [importData, supplierData, productData] = await Promise.all([
        adminApi.imports.list(),
        adminApi.suppliers.list(),
        adminApi.products.list(),
      ]);
      setImports(importData);
      setSuppliers(supplierData);
      setProducts(productData);
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    Promise.all([
      adminApi.imports.list(),
      adminApi.suppliers.list(),
      adminApi.products.list(),
    ])
      .then(([importData, supplierData, productData]) => {
        setImports(importData);
        setSuppliers(supplierData);
        setProducts(productData);
      })
      .catch((error) => alert(error.message));
  }, []);

  const filteredImports = imports.filter((item) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      item.id.toLowerCase().includes(keyword) ||
      item.supplier.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "Tất cả" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalValue = imports.reduce((sum, item) => sum + item.total, 0);

  const totalQuantity = imports.reduce((sum, item) => sum + item.quantity, 0);

  const completedImports = imports.filter(
    (item) => item.status === "Đã nhập",
  ).length;

  const pendingImports = imports.filter(
    (item) => item.status === "Chờ nhập",
  ).length;

  const formatMoney = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value) + "đ";
  };

  const openAddModal = () => {
    setSelectedImport(null);

    setForm({
      id: `PN${String(imports.length + 1).padStart(3, "0")}`,
      supplierId: "",
      date: "",
      productId: "",
      variantId: "",
      quantity: "",
      unitPrice: "",
      status: "Chờ nhập",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImport(null);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.supplierId) {
      alert("Vui lòng chọn nhà cung cấp!");
      return;
    }

    if (!form.date) {
      alert("Vui lòng chọn ngày nhập!");
      return;
    }

    if (
      !form.productId ||
      !form.variantId ||
      !form.quantity ||
      form.unitPrice === ""
    ) {
      alert(
        "Vui lòng chọn sản phẩm, biến thể và nhập đầy đủ số lượng, giá nhập!",
      );
      return;
    }

    setSaving(true);
    try {
      await adminApi.imports.create(form);
      await loadData();
      closeModal();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa phiếu nhập "${item.id}" không?`,
    );

    if (confirmDelete) {
      try {
        await adminApi.imports.delete(item.rawId);
        setImports(imports.filter((importItem) => importItem.id !== item.id));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const openDetail = (item) => {
    setSelectedImport(item);
  };

  const handleReceive = async () => {
    setReceiving(true);
    try {
      await adminApi.imports.receive(selectedImport.rawId);
      await loadData();
      setSelectedImport({ ...selectedImport, status: "Đã nhập" });
    } catch (error) {
      alert(error.message);
    } finally {
      setReceiving(false);
    }
  };

  return (
    <>
      <link rel="stylesheet" href="/css/nhap-hang.css" />

      <div className="import-management">
        {/* HEADER */}
        <div className="import-page-header">
          <div>
            <h1>Quản lý nhập hàng</h1>

            <p>Quản lý các phiếu nhập hàng và nhập kho sản phẩm</p>
          </div>

          <button className="import-add-btn" onClick={openAddModal}>
            <Plus size={18} />
            Tạo phiếu nhập
          </button>
        </div>

        {/* STATISTICS */}
        <div className="import-stat-grid">
          <div className="import-stat-card">
            <div className="import-stat-icon">
              <PackagePlus size={22} />
            </div>

            <div>
              <span>Tổng phiếu nhập</span>
              <strong>{imports.length}</strong>
            </div>
          </div>

          <div className="import-stat-card">
            <div className="import-stat-icon active">
              <CalendarDays size={22} />
            </div>

            <div>
              <span>Đã nhập hàng</span>
              <strong>{completedImports}</strong>
            </div>
          </div>

          <div className="import-stat-card">
            <div className="import-stat-icon warning">
              <Truck size={22} />
            </div>

            <div>
              <span>Chờ nhập</span>
              <strong>{pendingImports}</strong>
            </div>
          </div>

          <div className="import-stat-card">
            <div className="import-stat-icon money">
              <CircleDollarSign size={22} />
            </div>

            <div>
              <span>Tổng tiền nhập</span>
              <strong>{formatMoney(totalValue)}</strong>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="import-table-card">
          <div className="import-toolbar">
            <div>
              <h2>Danh sách phiếu nhập</h2>

              <p>{filteredImports.length} phiếu nhập</p>
            </div>

            <div className="import-toolbar-right">
              <div className="import-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Tìm mã phiếu hoặc nhà cung cấp..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="import-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>Tất cả</option>
                <option>Đã nhập</option>
                <option>Chờ nhập</option>
              </select>
            </div>
          </div>

          <div className="import-table-wrapper">
            <table className="import-table">
              <thead>
                <tr>
                  <th>MÃ PHIẾU</th>
                  <th>NHÀ CUNG CẤP</th>
                  <th>NGÀY NHẬP</th>
                  <th>SẢN PHẨM</th>
                  <th>SỐ LƯỢNG</th>
                  <th>TỔNG TIỀN</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>

              <tbody>
                {filteredImports.length > 0 ? (
                  filteredImports.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="import-code">{item.id}</span>
                      </td>

                      <td>
                        <div className="import-supplier">
                          <div className="import-supplier-icon">
                            <Truck size={17} />
                          </div>

                          <strong>{item.supplier}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="import-date">{item.date}</span>
                      </td>

                      <td>
                        <span className="import-product-count">
                          {item.products}
                        </span>
                      </td>

                      <td>
                        <strong className="import-quantity">
                          {item.quantity}
                        </strong>
                      </td>

                      <td>
                        <strong className="import-money">
                          {formatMoney(item.total)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            item.status === "Đã nhập"
                              ? "import-status completed"
                              : "import-status pending"
                          }
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <div className="import-actions">
                          <button
                            className="import-action view"
                            onClick={() => openDetail(item)}
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            className="import-action delete"
                            onClick={() => handleDelete(item)}
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
                    <td colSpan="8" className="import-empty">
                      Không tìm thấy phiếu nhập
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="import-table-footer">
            <span>
              Hiển thị {filteredImports.length} / {imports.length} phiếu nhập
            </span>

            <span>
              Tổng số lượng: <strong>{totalQuantity}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {showModal && (
        <div className="import-modal-overlay">
          <div className="import-modal">
            <div className="import-modal-header">
              <div>
                <h2>Tạo phiếu nhập hàng</h2>

                <p>Nhập thông tin phiếu nhập mới</p>
              </div>

              <button className="import-modal-close" onClick={closeModal}>
                <X size={19} />
              </button>
            </div>

            <form className="import-form" onSubmit={handleSubmit}>
              <div className="import-form-row">
                <div className="import-form-group">
                  <label>Mã phiếu nhập</label>

                  <input type="text" name="id" value={form.id} disabled />
                </div>

                <div className="import-form-group">
                  <label>
                    Nhà cung cấp <span>*</span>
                  </label>

                  <select
                    name="supplierId"
                    value={form.supplierId}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        supplierId: e.target.value,
                        productId: "",
                        variantId: "",
                      });
                    }}
                  >
                    <option value="">-- Chọn nhà cung cấp --</option>

                    {suppliers.map((supplier) => (
                      <option key={supplier.rawId} value={supplier.rawId}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="import-form-row">
                <div className="import-form-group">
                  <label>
                    Ngày nhập <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                  />
                </div>

                <div className="import-form-group">
                  <label>
                    Sản phẩm <span>*</span>
                  </label>

                  <select
                    name="productId"
                    value={form.productId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        productId: e.target.value,
                        variantId: "",
                      })
                    }
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {products
                      .filter(
                        (item) =>
                          !form.supplierId ||
                          item.supplierId === Number(form.supplierId),
                      )
                      .map((item) => (
                        <option key={item.rawId} value={item.rawId}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="import-form-group">
                <label>
                  Biến thể size / màu <span>*</span>
                </label>
                <select
                  disabled={!form.productId}
                  name="variantId"
                  value={form.variantId}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn biến thể --</option>
                  {(
                    products.find(
                      (item) => item.rawId === Number(form.productId),
                    )?.variants || []
                  ).map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      Size {variant.size || "-"} ·{" "}
                      {variant.color || "Không màu"} · tồn {variant.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="import-form-row">
                <div className="import-form-group">
                  <label>
                    Tổng số lượng <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="Nhập tổng số lượng"
                    min="1"
                  />
                </div>

                <div className="import-form-group">
                  <label>
                    Giá nhập / sản phẩm <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="unitPrice"
                    value={form.unitPrice}
                    onChange={handleChange}
                    placeholder="Nhập giá nhập"
                    min="0"
                  />
                </div>
              </div>

              <div className="import-form-group">
                <label>Trạng thái</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Chờ nhập">Chờ nhập</option>

                  <option value="Đã nhập">Đã nhập</option>
                </select>
              </div>

              <div className="import-modal-footer">
                <button
                  type="button"
                  className="import-btn-cancel"
                  onClick={closeModal}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="import-btn-save"
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Tạo phiếu nhập"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedImport && (
        <div className="import-modal-overlay">
          <div className="import-detail-modal">
            <div className="import-modal-header">
              <div>
                <h2>Chi tiết phiếu nhập</h2>

                <p>Thông tin phiếu {selectedImport.id}</p>
              </div>

              <button
                className="import-modal-close"
                onClick={() => setSelectedImport(null)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="import-detail-content">
              <div className="import-detail-top">
                <div>
                  <span>Mã phiếu</span>
                  <strong>{selectedImport.id}</strong>
                </div>

                <div>
                  <span>Ngày nhập</span>
                  <strong>{selectedImport.date}</strong>
                </div>

                <div>
                  <span>Trạng thái</span>

                  <b
                    className={
                      selectedImport.status === "Đã nhập"
                        ? "import-status completed"
                        : "import-status pending"
                    }
                  >
                    {selectedImport.status}
                  </b>
                </div>
              </div>

              <div className="import-detail-box">
                <h3>Nhà cung cấp</h3>

                <div className="import-detail-supplier">
                  <div className="import-supplier-icon">
                    <Truck size={18} />
                  </div>

                  <strong>{selectedImport.supplier}</strong>
                </div>
              </div>

              <div className="import-detail-summary">
                <div>
                  <span>Số loại sản phẩm</span>
                  <strong>{selectedImport.products}</strong>
                </div>

                <div>
                  <span>Tổng số lượng</span>
                  <strong>{selectedImport.quantity}</strong>
                </div>

                <div>
                  <span>Tổng tiền</span>
                  <strong>{formatMoney(selectedImport.total)}</strong>
                </div>
              </div>
            </div>

            <div className="import-detail-footer">
              {selectedImport.status === "Chờ nhập" && (
                <button
                  className="import-btn-save"
                  onClick={handleReceive}
                  disabled={receiving}
                >
                  {receiving ? "Đang xác nhận..." : "Xác nhận đã nhập"}
                </button>
              )}

              <button
                className="import-btn-cancel"
                onClick={() => setSelectedImport(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
