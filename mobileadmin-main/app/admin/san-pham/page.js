"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  X,
  Image as ImageIcon,
} from "lucide-react";

import { adminApi } from "@/lib/adminApi";

const initialProducts = [
  {
    id: "SP001",
    name: "Máy chạy bộ ELIP Platin",
    category: "Máy chạy bộ",
    price: 18900000,
    stock: 25,
    status: "Đang bán",
  },
  {
    id: "SP002",
    name: "Xe đạp tập ELIP",
    category: "Xe đạp tập",
    price: 7500000,
    stock: 18,
    status: "Đang bán",
  },
  {
    id: "SP003",
    name: "Ghế tập tạ đa năng",
    category: "Dụng cụ tập",
    price: 4200000,
    stock: 32,
    status: "Đang bán",
  },
  {
    id: "SP004",
    name: "Tạ tay 10kg",
    category: "Tạ",
    price: 650000,
    stock: 45,
    status: "Đang bán",
  },
  {
    id: "SP005",
    name: "Thảm Yoga cao cấp",
    category: "Yoga",
    price: 450000,
    stock: 8,
    status: "Sắp hết",
  },
  {
    id: "SP006",
    name: "Xà đơn treo tường",
    category: "Dụng cụ tập",
    price: 890000,
    stock: 0,
    status: "Hết hàng",
  },
  {
    id: "SP007",
    name: "Bóng tập Yoga 65cm",
    category: "Yoga",
    price: 390000,
    stock: 20,
    status: "Đang bán",
  },
  {
    id: "SP008",
    name: "Tạ bình vôi 16kg",
    category: "Tạ",
    price: 1250000,
    stock: 12,
    status: "Đang bán",
  },
];

export default function ProductPage() {
  const [products, setProducts] = useState(initialProducts);
  const [productTypes, setProductTypes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  const [form, setForm] = useState({
    brand: "",
    categoryId: "",
    description: "",
    image: "",
    name: "",
    supplierId: "",
    status: "Đang bán",
    variants: [{ color: "", id: null, price: "", size: "", stock: "" }],
  });

  const categories = ["Tất cả", ...productTypes.map((item) => item.name)];

  async function loadData() {
    try {
      const [productData, typeData, supplierData] = await Promise.all([
        adminApi.products.list(),
        adminApi.productTypes.list(),
        adminApi.suppliers.list(),
      ]);
      setProducts(productData);
      setProductTypes(typeData);
      setSuppliers(supplierData);
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    Promise.all([
      adminApi.products.list(),
      adminApi.productTypes.list(),
      adminApi.suppliers.list(),
    ])
      .then(([productData, typeData, supplierData]) => {
        setProducts(productData);
        setProductTypes(typeData);
        setSuppliers(supplierData);
      })
      .catch((error) => alert(error.message));
  }, []);

  useEffect(() => {
    if (!viewingProduct) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setViewingProduct(null);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewingProduct]);

  function handleImageSelect(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert("Ảnh sản phẩm không được lớn hơn 4 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, image: String(reader.result || "") }));
    };
    reader.onerror = () => alert("Không thể đọc tệp ảnh đã chọn.");
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  const filteredProducts = products.filter((product) => {
    const matchSearch =
      product.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      product.id
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchCategory =
      category === "Tất cả" ||
      product.category === category;

    return matchSearch && matchCategory;
  });

  function openAddModal() {
    setEditingProduct(null);

    setForm({
      brand: "",
      categoryId: productTypes[0]?.rawId || "",
      description: "",
      image: "",
      name: "",
      supplierId: suppliers[0]?.rawId || "",
      status: "Đang bán",
      variants: [{ color: "", id: null, price: "", size: "", stock: "" }],
    });

    setShowModal(true);
  }

  function openEditModal(product) {
    setEditingProduct(product);

    setForm({
      brand: product.brand || "",
      categoryId: product.categoryId,
      description: product.description || "",
      image: product.image || "",
      name: product.name,
      supplierId: product.supplierId,
      status: product.status,
      variants: product.variants?.length
        ? product.variants.map((variant) => ({ ...variant }))
        : [{ color: "", id: null, price: product.price, size: "", stock: product.stock }],
    });

    setShowModal(true);
  }

  function addVariant() {
    setForm((current) => ({
      ...current,
      variants: [
        ...current.variants,
        { color: "", id: null, price: "", size: "", stock: "" },
      ],
    }));
  }

  function updateVariant(index, field, value) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant
      ),
    }));
  }

  function removeVariant(index) {
    setForm((current) => ({
      ...current,
      variants: current.variants.filter((_, variantIndex) => variantIndex !== index),
    }));
  }

  function closeModal() {
    setShowModal(false);
    setEditingProduct(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const invalidVariant = form.variants.some(
      (variant) =>
        !variant.size.trim() ||
        !variant.color.trim() ||
        variant.price === "" ||
        variant.stock === "" ||
        Number(variant.price) < 0 ||
        !Number.isInteger(Number(variant.stock)) ||
        Number(variant.stock) < 0
    );
    if (!form.name || !form.categoryId || !form.supplierId || !form.variants.length || invalidVariant) {
      alert("Vui lòng nhập đầy đủ thông tin sản phẩm.");
      return;
    }

    setSaving(true);
    try {
      if (editingProduct) {
        await adminApi.products.update(editingProduct.rawId, form);
      } else {
        await adminApi.products.create(form);
      }
      await loadData();
      closeModal();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id) {
    const product = products.find(
      (item) => item.id === id
    );

    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa "${product.name}" không?`
    );

    if (!confirmDelete) return;

    try {
      await adminApi.products.delete(product.rawId);
      setProducts(products.filter((item) => item.id !== id));
    } catch (error) {
      alert(error.message);
    }
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  }

  return (
    <>
        <link rel="stylesheet" href="/css/san-pham.css" />
        <div className="product-management">

        {/* PAGE HEADER */}

        <div className="product-page-header">

            <div>
            <h1>Quản lý sản phẩm</h1>

            <p>
                Quản lý danh sách sản phẩm của cửa hàng
                Elip Sport.
            </p>
            </div>

            <button
            className="product-add-btn"
            onClick={openAddModal}
            >
            <Plus size={17} />
            Thêm sản phẩm
            </button>

        </div>


        {/* STATISTICS */}

        <div className="product-stat-grid">

            <div className="product-stat-card">

            <div className="product-stat-icon total">
                <Package size={19} />
            </div>

            <div className="product-stat-info">
                <span>Tổng sản phẩm</span>
                <strong>{products.length}</strong>
            </div>

            </div>


            <div className="product-stat-card">

            <div className="product-stat-icon selling">
                <Package size={19} />
            </div>

            <div className="product-stat-info">
                <span>Đang bán</span>

                <strong>
                {
                    products.filter(
                    (p) => p.status === "Đang bán"
                    ).length
                }
                </strong>
            </div>

            </div>


            <div className="product-stat-card">

            <div className="product-stat-icon low">
                <Package size={19} />
            </div>

            <div className="product-stat-info">
                <span>Sắp hết hàng</span>

                <strong>
                {
                    products.filter(
                    (p) => p.status === "Sắp hết"
                    ).length
                }
                </strong>
            </div>

            </div>


            <div className="product-stat-card">

            <div className="product-stat-icon out">
                <Package size={19} />
            </div>

            <div className="product-stat-info">
                <span>Hết hàng</span>

                <strong>
                {
                    products.filter(
                    (p) => p.status === "Hết hàng"
                    ).length
                }
                </strong>
            </div>

            </div>

        </div>


        {/* TABLE CARD */}

        <div className="product-table-card">

            {/* FILTER */}

            <div className="product-toolbar">

            <div className="product-search">

                <Search size={18} />

                <input
                type="text"
                placeholder="Tìm theo mã hoặc tên sản phẩm..."
                value={search}
                onChange={(e) =>
                    setSearch(e.target.value)
                }
                />

            </div>


            <select
                className="product-filter"
                value={category}
                onChange={(e) =>
                setCategory(e.target.value)
                }
            >
                {categories.map((item) => (
                <option
                    key={item}
                    value={item}
                >
                    {item}
                </option>
                ))}
            </select>

            </div>


            {/* TABLE */}

            <div className="product-table-wrapper">

            <table className="product-table">

                <thead>

                <tr>
                    <th>Sản phẩm</th>
                    <th>Loại sản phẩm</th>
                    <th>Giá bán</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>

                </thead>


                <tbody>

                {filteredProducts.length === 0 ? (

                    <tr>

                    <td
                        colSpan="6"
                        className="product-empty"
                    >
                        Không tìm thấy sản phẩm.
                    </td>

                    </tr>

                ) : (

                    filteredProducts.map((product) => (

                    <tr key={product.id}>

                        {/* PRODUCT */}

                        <td>

                        <div className="product-cell">

                            <div className="product-thumb">
                            {product.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img alt={product.name} src={product.image} />
                            ) : (
                                <ImageIcon size={21} />
                            )}
                            </div>

                            <div>

                            <strong>
                                {product.name}
                            </strong>

                            <span>
                                {product.id} · {product.variants?.length || 0} biến thể
                            </span>

                            </div>

                        </div>

                        </td>


                        {/* CATEGORY */}

                        <td>
                        <span className="product-category">
                            {product.category}
                        </span>
                        </td>


                        {/* PRICE */}

                        <td>

                        <strong className="product-price">
                            {formatPrice(
                            product.price
                            )}
                        </strong>

                        </td>


                        {/* STOCK */}

                        <td>

                        <span
                            className={
                            product.stock <= 5
                                ? "product-stock low"
                                : "product-stock"
                            }
                        >
                            {product.stock}
                        </span>

                        </td>


                        {/* STATUS */}

                        <td>

                        <ProductStatus
                            status={product.status}
                        />

                        </td>


                        {/* ACTIONS */}

                        <td>

                        <div className="product-actions">

                            <button
                            className="product-action view"
                            aria-label={`Xem chi tiết ${product.name}`}
                            onClick={() => setViewingProduct(product)}
                            title="Xem chi tiết"
                            >
                            <Eye size={16} />
                            </button>

                            <button
                            className="product-action edit"
                            title="Sửa"
                            onClick={() =>
                                openEditModal(product)
                            }
                            >
                            <Edit size={16} />
                            </button>

                            <button
                            className="product-action delete"
                            title="Xóa"
                            onClick={() =>
                                deleteProduct(product.id)
                            }
                            >
                            <Trash2 size={16} />
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

            <div className="product-table-footer">

            <span>
                Hiển thị{" "}
                <strong>
                {filteredProducts.length}
                </strong>{" "}
                / {products.length} sản phẩm
            </span>

            </div>

        </div>


        {/* MODAL */}

        {showModal && (

            <div
            className="product-modal-overlay"
            onClick={closeModal}
            >

            <div
                className="product-modal"
                onClick={(e) =>
                e.stopPropagation()
                }
            >

                <div className="product-modal-header">

                <div>

                    <h2>
                    {editingProduct
                        ? "Chỉnh sửa sản phẩm"
                        : "Thêm sản phẩm"}
                    </h2>

                    <p>
                    Nhập thông tin sản phẩm
                    </p>

                </div>

                <button
                    className="product-modal-close"
                    onClick={closeModal}
                >
                    <X size={20} />
                </button>

                </div>


                <form className="product-form" onSubmit={handleSubmit}>

                {/* IMAGE */}

                <label className={`product-image-upload ${form.image ? "has-image" : ""}`}>
                    {form.image ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="Ảnh sản phẩm xem trước" className="product-image-preview" src={form.image} />
                        <span className="product-image-change-label">Chọn ảnh khác</span>
                    </>
                    ) : (
                    <>
                        <ImageIcon size={27} />
                        <strong>Chọn ảnh sản phẩm</strong>
                        <span>JPG, PNG hoặc WEBP</span>
                        <small>Tối đa 4 MB</small>
                    </>
                    )}
                    <input
                    accept="image/jpeg,image/png,image/webp"
                    className="product-image-file-input"
                    onChange={handleImageSelect}
                    type="file"
                    />
                </label>

                {form.image && (
                    <button
                    className="product-remove-image-btn"
                    onClick={() => setForm({ ...form, image: "" })}
                    type="button"
                    >
                    Xóa ảnh đã chọn
                    </button>
                )}


                {/* NAME */}

                <div className="product-form-group">

                    <label>
                    Tên sản phẩm
                    </label>

                    <input
                    type="text"
                    placeholder="Nhập tên sản phẩm"
                    value={form.name}
                    onChange={(e) =>
                        setForm({
                        ...form,
                        name: e.target.value,
                        })
                    }
                    />

                </div>


                {/* CATEGORY */}

                <div className="product-form-row">

                    <div className="product-form-group">

                    <label>
                        Loại sản phẩm
                    </label>

                    <select
                        value={form.categoryId}
                        onChange={(e) =>
                        setForm({
                            ...form,
                            categoryId: e.target.value,
                        })
                        }
                    >
                        {productTypes.map((item) => (
                            <option
                            key={item.rawId}
                            value={item.rawId}
                            >
                            {item.name}
                            </option>
                        ))}
                    </select>

                    </div>


                    <div className="product-form-group">

                    <label>
                        Nhà cung cấp
                    </label>

                    <select
                        value={form.supplierId}
                        onChange={(e) =>
                        setForm({
                            ...form,
                            supplierId: e.target.value,
                        })
                        }
                    >
                        {suppliers.map((item) => (
                            <option key={item.rawId} value={item.rawId}>
                            {item.name}
                            </option>
                        ))}
                    </select>

                    </div>

                </div>


                <div className="product-variant-section">
                    <div className="product-variant-header">
                    <div>
                        <h3>Biến thể sản phẩm</h3>
                        <p>Giá bán và tồn kho được quản lý theo từng size, màu sắc.</p>
                    </div>
                    <button className="product-add-variant-btn" onClick={addVariant} type="button">
                        <Plus size={16} />
                        Thêm biến thể
                    </button>
                    </div>

                    <div className="product-variant-list">
                    {form.variants.map((variant, index) => (
                        <div className="product-variant-row" key={variant.id || `new-${index}`}>
                        <div className="product-variant-field">
                            <label>Size</label>
                            <input
                            onChange={(e) => updateVariant(index, "size", e.target.value)}
                            placeholder="Ví dụ: 40, M, số 5"
                            type="text"
                            value={variant.size}
                            />
                        </div>
                        <div className="product-variant-field">
                            <label>Màu sắc</label>
                            <input
                            onChange={(e) => updateVariant(index, "color", e.target.value)}
                            placeholder="Ví dụ: Trắng xanh"
                            type="text"
                            value={variant.color}
                            />
                        </div>
                        <div className="product-variant-field">
                            <label>Giá bán</label>
                            <input
                            min="0"
                            onChange={(e) => updateVariant(index, "price", e.target.value)}
                            placeholder="0"
                            type="number"
                            value={variant.price}
                            />
                        </div>
                        <div className="product-variant-field">
                            <label>Tồn kho</label>
                            <input
                            min="0"
                            onChange={(e) => updateVariant(index, "stock", e.target.value)}
                            placeholder="0"
                            step="1"
                            type="number"
                            value={variant.stock}
                            />
                        </div>
                        <button
                            aria-label="Xóa biến thể"
                            className="product-remove-variant-btn"
                            disabled={form.variants.length === 1}
                            onClick={() => removeVariant(index)}
                            title="Xóa biến thể"
                            type="button"
                        >
                            <Trash2 size={17} />
                        </button>
                        </div>
                    ))}
                    </div>
                </div>

                <div className="product-form-row">
                    <div className="product-form-group">
                    <label>Thương hiệu</label>
                    <input
                        type="text"
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        placeholder="Nhập thương hiệu"
                    />
                    </div>
                    <div className="product-form-group">
                    <label>Trạng thái</label>
                    <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                        <option>Đang bán</option>
                        <option>Hết hàng</option>
                    </select>
                    </div>
                </div>

                <div className="product-form-group">
                    <label>Mô tả</label>
                    <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả sản phẩm"
                    rows={3}
                    />
                </div>


                {/* BUTTON */}

                <div className="product-modal-footer">

                    <button
                    type="button"
                    className="product-btn-cancel"
                    onClick={closeModal}
                    >
                    Hủy
                    </button>

                    <button
                    type="submit"
                    className="product-btn-save"
                    disabled={saving}
                    >
                    {saving
                        ? "Đang lưu..."
                        : editingProduct
                        ? "Lưu thay đổi"
                        : "Thêm sản phẩm"}
                    </button>

                </div>

                </form>

            </div>

            </div>

        )}

        {viewingProduct && (
          <div
          className="product-modal-overlay"
          onClick={() => setViewingProduct(null)}
          >
          <section
            aria-labelledby="product-detail-title"
            aria-modal="true"
            className="product-modal product-detail-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="product-modal-header">
            <div>
              <h2 id="product-detail-title">Chi tiết sản phẩm</h2>
              <p>{viewingProduct.id}</p>
            </div>
            <button
              aria-label="Đóng chi tiết sản phẩm"
              className="product-modal-close"
              onClick={() => setViewingProduct(null)}
              type="button"
            >
              <X size={20} />
            </button>
            </div>

            <div className="product-detail-content">
            <div className="product-detail-overview">
              <div className="product-detail-image">
              {viewingProduct.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={viewingProduct.name} src={viewingProduct.image} />
              ) : (
                <ImageIcon size={36} />
              )}
              </div>
              <div className="product-detail-summary">
              <h3>{viewingProduct.name}</h3>
              <ProductStatus status={viewingProduct.status} />
              <div className="product-detail-fields">
                <div><span>Loại sản phẩm</span><strong>{viewingProduct.category}</strong></div>
                <div><span>Thương hiệu</span><strong>{viewingProduct.brand || "Chưa cập nhật"}</strong></div>
                <div><span>Nhà cung cấp</span><strong>{viewingProduct.supplier || "Chưa cập nhật"}</strong></div>
                <div><span>Giá bán từ</span><strong>{formatPrice(viewingProduct.price)}</strong></div>
                <div><span>Tổng tồn kho</span><strong>{viewingProduct.stock}</strong></div>
              </div>
              </div>
            </div>

            <div className="product-detail-description">
              <h3>Mô tả</h3>
              <p>{viewingProduct.description || "Chưa có mô tả sản phẩm."}</p>
            </div>

            <div className="product-detail-variants-section">
              <h3>Biến thể ({viewingProduct.variants?.length || 0})</h3>
              {viewingProduct.variants?.length ? (
              <div className="product-detail-variants-wrapper">
                <table className="product-detail-variants">
                <thead>
                  <tr><th>Size</th><th>Màu sắc</th><th>Giá bán</th><th>Tồn kho</th></tr>
                </thead>
                <tbody>
                  {viewingProduct.variants.map((variant, index) => (
                  <tr key={variant.id || `${variant.size}-${variant.color}-${index}`}>
                    <td>{variant.size || "-"}</td>
                    <td>{variant.color || "-"}</td>
                    <td>{formatPrice(variant.price)}</td>
                    <td>{variant.stock}</td>
                  </tr>
                  ))}
                </tbody>
                </table>
              </div>
              ) : (
              <p className="product-detail-empty">Sản phẩm chưa có biến thể.</p>
              )}
            </div>
            </div>
          </section>
          </div>
        )}

        </div>
    </>
  );
}


/* STATUS COMPONENT */

function ProductStatus({ status }) {

  let className = "status-active";

  if (status === "Sắp hết") {
    className = "status-warning";
  }

  if (status === "Hết hàng") {
    className = "status-danger";
  }

  return (
    <span
      className={`product-status ${className}`}
    >
      <span></span>
      {status}
    </span>
  );
}
