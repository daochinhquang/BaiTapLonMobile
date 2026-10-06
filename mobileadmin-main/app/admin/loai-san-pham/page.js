"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Tags,
} from "lucide-react";

import { adminApi } from "@/lib/adminApi";

const initialCategories = [
  {
    id: "LSP001",
    name: "Máy chạy bộ",
    description: "Các loại máy chạy bộ thể thao",
    products: 45,
    status: "Đang sử dụng",
  },
  {
    id: "LSP002",
    name: "Xe đạp tập",
    description: "Xe đạp tập thể dục trong nhà",
    products: 32,
    status: "Đang sử dụng",
  },
  {
    id: "LSP003",
    name: "Dụng cụ tập",
    description: "Các dụng cụ hỗ trợ tập luyện",
    products: 86,
    status: "Đang sử dụng",
  },
  {
    id: "LSP004",
    name: "Tạ",
    description: "Tạ tay, tạ bình vôi và các loại tạ",
    products: 54,
    status: "Đang sử dụng",
  },
  {
    id: "LSP005",
    name: "Yoga",
    description: "Sản phẩm và dụng cụ tập Yoga",
    products: 38,
    status: "Đang sử dụng",
  },
  {
    id: "LSP006",
    name: "Phụ kiện thể thao",
    description: "Các loại phụ kiện thể thao",
    products: 28,
    status: "Đang sử dụng",
  },
  {
    id: "LSP007",
    name: "Thiết bị phòng gym",
    description: "Thiết bị dành cho phòng gym",
    products: 65,
    status: "Đang sử dụng",
  },
  {
    id: "LSP008",
    name: "Phụ kiện khác",
    description: "Các sản phẩm thể thao khác",
    products: 10,
    status: "Tạm ngưng",
  },
];

export default function LoaiSanPhamPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [parentCategories, setParentCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState({
    categoryId: "",
    id: "",
    name: "",
    description: "",
    status: "Đang sử dụng",
  });

  async function loadData() {
    try {
      const [types, parents] = await Promise.all([
        adminApi.productTypes.list(),
        adminApi.categories.list(),
      ]);
      setCategories(types);
      setParentCategories(parents);
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    Promise.all([
      adminApi.productTypes.list(),
      adminApi.categories.list(),
    ])
      .then(([types, parents]) => {
        setCategories(types);
        setParentCategories(parents);
      })
      .catch((error) => alert(error.message));
  }, []);

  const filteredCategories = categories.filter(
    (item) =>
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingCategory(null);
    const nextId = Math.max(0, ...categories.map((item) => Number(item.rawId) || 0)) + 1;

    setForm({
      categoryId: parentCategories[0]?.id || "",
      id: `LSP${String(nextId).padStart(3, "0")}`,
      name: "",
      description: "",
      status: "Đang sử dụng",
    });

    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);

    setForm({
      categoryId: category.categoryId,
      id: category.id,
      name: category.name,
      description: category.description,
      status: category.status,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.name === "id" ? e.target.value.toUpperCase() : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.categoryId) {
      alert("Vui lòng nhập tên loại sản phẩm và chọn danh mục!");
      return;
    }

    if (!/^LSP\d+$/i.test(form.id.trim())) {
      alert("Mã loại sản phẩm phải có dạng LSP001.");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await adminApi.productTypes.update(editingCategory.rawId, form);
      } else {
        await adminApi.productTypes.create(form);
      }
      await loadData();
      closeModal();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (category.products > 0) {
      alert(
        `Không thể xóa "${category.name}" vì đang có ${category.products} sản phẩm thuộc loại này.`
      );
      return;
    }

    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa loại "${category.name}" không?`
    );

    if (confirmDelete) {
      try {
        await adminApi.productTypes.delete(category.rawId);
        setCategories(categories.filter((item) => item.id !== category.id));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const totalProducts = categories.reduce(
    (sum, item) => sum + item.products,
    0
  );

  const activeCategories = categories.filter(
    (item) => item.status === "Đang sử dụng"
  ).length;

  const inactiveCategories = categories.filter(
    (item) => item.status === "Tạm ngưng"
  ).length;

  return (
    <>
      <link rel="stylesheet" href="/css/loai-san-pham.css" />

      <div className="category-management">

        {/* HEADER */}
        <div className="category-page-header">
          <div>
            <h1>Loại sản phẩm</h1>
            <p>
              Quản lý danh mục và phân loại sản phẩm của Elip Sport
            </p>
          </div>

          <button
            className="category-add-btn"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Thêm loại sản phẩm
          </button>
        </div>

        {/* STATISTICS */}
        <div className="category-stat-grid">

          <div className="category-stat-card">
            <div className="category-stat-icon">
              <Tags size={22} />
            </div>

            <div>
              <span>Tổng loại sản phẩm</span>
              <strong>{categories.length}</strong>
            </div>
          </div>

          <div className="category-stat-card">
            <div className="category-stat-icon active">
              <Tags size={22} />
            </div>

            <div>
              <span>Đang sử dụng</span>
              <strong>{activeCategories}</strong>
            </div>
          </div>

          <div className="category-stat-card">
            <div className="category-stat-icon warning">
              <Tags size={22} />
            </div>

            <div>
              <span>Tạm ngưng</span>
              <strong>{inactiveCategories}</strong>
            </div>
          </div>

          <div className="category-stat-card">
            <div className="category-stat-icon products">
              <Tags size={22} />
            </div>

            <div>
              <span>Tổng sản phẩm</span>
              <strong>{totalProducts}</strong>
            </div>
          </div>

        </div>

        {/* TABLE */}
        <div className="category-table-card">

          <div className="category-toolbar">

            <div>
              <h2>Danh sách loại sản phẩm</h2>
              <p>
                {filteredCategories.length} loại sản phẩm
              </p>
            </div>

            <div className="category-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Tìm kiếm loại sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

          </div>

          <div className="category-table-wrapper">

            <table className="category-table">

              <thead>
                <tr>
                  <th>MÃ LOẠI</th>
                  <th>TÊN LOẠI SẢN PHẨM</th>
                  <th>MÔ TẢ</th>
                  <th>SẢN PHẨM</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>

              <tbody>

                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <tr key={category.id}>

                      <td>
                        <span className="category-code">
                          {category.id}
                        </span>
                      </td>

                      <td>
                        <div className="category-name">
                          <div className="category-icon">
                            <Tags size={18} />
                          </div>

                          <strong>{category.name}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="category-description">
                          {category.description}
                        </span>
                      </td>

                      <td>
                        <span className="product-count">
                          {category.products}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            category.status === "Đang sử dụng"
                              ? "category-status active"
                              : "category-status inactive"
                          }
                        >
                          {category.status}
                        </span>
                      </td>

                      <td>
                        <div className="category-actions">

                          <button
                            className="category-action edit"
                            onClick={() =>
                              openEditModal(category)
                            }
                            title="Sửa"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="category-action delete"
                            onClick={() =>
                              handleDelete(category)
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
                      colSpan="6"
                      className="category-empty"
                    >
                      Không tìm thấy loại sản phẩm
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

          {/* FOOTER */}
          <div className="category-table-footer">

            <span>
              Hiển thị {filteredCategories.length} /{" "}
              {categories.length} loại sản phẩm
            </span>

            <div className="category-pagination">
              <button disabled>‹</button>
              <button className="active">1</button>
              <button disabled>›</button>
            </div>

          </div>

        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="category-modal-overlay">

          <div className="category-modal">

            <div className="category-modal-header">

              <div>
                <h2>
                  {editingCategory
                    ? "Chỉnh sửa loại sản phẩm"
                    : "Thêm loại sản phẩm"}
                </h2>

                <p>
                  {editingCategory
                    ? "Cập nhật thông tin loại sản phẩm"
                    : "Nhập thông tin loại sản phẩm mới"}
                </p>
              </div>

              <button
                className="category-modal-close"
                onClick={closeModal}
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="category-form"
              onSubmit={handleSubmit}
            >

              <div className="category-form-group">
                <label>Mã loại sản phẩm</label>

                <input
                  type="text"
                  name="id"
                  value={form.id}
                  onChange={handleChange}
                  maxLength={13}
                />
              </div>

              <div className="category-form-group">
                <label>
                  Tên loại sản phẩm
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nhập tên loại sản phẩm"
                />
              </div>

              <div className="category-form-group">
                <label>Danh mục <span>*</span></label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange}>
                  <option value="">-- Chọn danh mục --</option>
                  {parentCategories.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="category-form-group">
                <label>Mô tả</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả loại sản phẩm..."
                />
              </div>

              <div className="category-form-group">
                <label>Trạng thái</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Đang sử dụng">
                    Đang sử dụng
                  </option>

                  <option value="Tạm ngưng">
                    Tạm ngưng
                  </option>
                </select>
              </div>

              <div className="category-modal-footer">

                <button
                  type="button"
                  className="category-btn-cancel"
                  onClick={closeModal}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="category-btn-save"
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : editingCategory ? "Cập nhật" : "Thêm loại"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </>
  );
}
