"use client";

import { cloneElement, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CircleDollarSign,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";

import { adminApi } from "@/lib/adminApi";
import "@/public/css/voucher.css";

const statusOptions = ["Đang hoạt động", "Tạm ngưng", "Hết hạn"];

function money(value) {
  return new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number(value) || 0);
}

function toDateTimeLocal(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function emptyForm() {
  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + 30);

  return {
    code: "",
    discountType: "tien_mat",
    discountValue: "",
    endsAt: toDateTimeLocal(endsAt),
    maxDiscount: "",
    minOrderValue: 0,
    name: "",
    quantity: 50,
    startsAt: toDateTimeLocal(startsAt),
    status: "Đang hoạt động",
  };
}

function discountText(voucher) {
  if (voucher.discountType === "phan_tram") {
    return `${voucher.discountValue}%${
      voucher.maxDiscount !== "" ? `, tối đa ${money(voucher.maxDiscount)}` : ""
    }`;
  }

  return money(voucher.discountValue);
}

export default function VoucherPage() {
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [vouchers, setVouchers] = useState([]);

  async function loadVouchers() {
    setLoading(true);
    try {
      setVouchers(await adminApi.vouchers.list());
      setError("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    void adminApi.vouchers.list()
      .then((items) => { if (active) setVouchers(items); })
      .catch((error) => { if (active) setError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredVouchers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return vouchers.filter(
      (voucher) =>
        (!statusFilter || voucher.status === statusFilter) &&
        (voucher.code.toLowerCase().includes(keyword) ||
        voucher.name.toLowerCase().includes(keyword)),
    );
  }, [search, statusFilter, vouchers]);

  const activeCount = vouchers.filter(
    (voucher) => voucher.status === "Đang hoạt động",
  ).length;
  const pausedCount = vouchers.filter(
    (voucher) => voucher.status !== "Đang hoạt động",
  ).length;
  const remainingCount = vouchers.reduce(
    (total, voucher) => total + Number(voucher.quantity || 0),
    0,
  );
  const usedCount = vouchers.reduce(
    (total, voucher) => total + Number(voucher.usedCount || 0),
    0,
  );

  function openAddModal() {
    setFormError("");
    setEditingVoucher(null);
    setForm(emptyForm());
    setShowModal(true);
  }

  function openEditModal(voucher) {
    setFormError("");
    setEditingVoucher(voucher);
    setForm({
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      endsAt: voucher.endsAtValue,
      maxDiscount: voucher.maxDiscount,
      minOrderValue: voucher.minOrderValue,
      name: voucher.name,
      quantity: voucher.quantity,
      startsAt: voucher.startsAtValue,
      status: voucher.editingStatus,
    });
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;
    setShowModal(false);
    setEditingVoucher(null);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "code" ? value.toUpperCase().replace(/\s/g, "") : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setFormError("");

    if (!form.code.trim() || !form.name.trim()) {
      setFormError("Vui lòng nhập mã voucher và tên chương trình.");
      return;
    }
    if (Number(form.discountValue) <= 0) {
      setFormError("Giá trị giảm phải lớn hơn 0.");
      return;
    }
    if (form.discountType === "phan_tram" && Number(form.discountValue) > 100) {
      setFormError("Voucher phần trăm không được vượt quá 100%.");
      return;
    }
    if (new Date(form.endsAt).getTime() <= new Date(form.startsAt).getTime()) {
      setFormError("Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }

    setSaving(true);
    try {
      if (editingVoucher) {
        await adminApi.vouchers.update(editingVoucher.rawId, form);
      } else {
        await adminApi.vouchers.create(form);
      }
      await loadVouchers();
      setShowModal(false);
      setEditingVoucher(null);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(voucher) {
    if (deletingId !== null) return;
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa hoặc tạm ngưng voucher "${voucher.code}" không?`,
    );
    if (!confirmDelete) return;
    setDeletingId(voucher.rawId);
    try {
      await adminApi.vouchers.delete(voucher.rawId);
      await loadVouchers();
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="voucher-management">
        <div className="voucher-page-header">
          <div>
            <h1>Voucher</h1>
          </div>

          <button className="voucher-add-btn" onClick={openAddModal} type="button">
            <Plus size={18} />
            Thêm voucher
          </button>
        </div>

        <div className="voucher-stat-grid">
          <StatCard icon={<TicketPercent size={22} />} label="Tổng voucher" value={vouchers.length} />
          <StatCard icon={<TicketPercent size={22} />} label="Đang hoạt động" tone="active" value={activeCount} />
          <StatCard icon={<CalendarDays size={22} />} label="Chưa khả dụng" tone="warning" value={pausedCount} />
          <StatCard icon={<CircleDollarSign size={22} />} label="Còn lượt / đã dùng" tone="products" value={`${remainingCount} / ${usedCount}`} />
        </div>

        {error ? <p className="voucher-error" role="alert">{error}</p> : null}
        <div className="voucher-table-card" aria-busy={loading}>
          <div className="voucher-toolbar">
            <div>
              <h2>Danh sách voucher</h2>
              <p>{filteredVouchers.length} voucher</p>
            </div>

            <div className="voucher-filters">
              <select aria-label="Lọc trạng thái" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                <option value="">Tất cả trạng thái</option>
                {[...statusOptions, "Chưa bắt đầu", "Hết lượt"].map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <div className="voucher-search">
              <Search size={18} />
              <input
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Tìm voucher"
                placeholder="Tìm theo mã hoặc tên voucher..."
                type="text"
                value={search}
              />
              </div>
              <button aria-label="Làm mới" className="voucher-action refresh" disabled={loading} onClick={() => void loadVouchers()} title="Làm mới" type="button">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="voucher-table-wrapper">
            <table className="voucher-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Chương trình</th>
                  <th>Giảm giá</th>
                  <th>Điều kiện</th>
                  <th>Số lượt</th>
                  <th>Hiệu lực</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="voucher-empty" colSpan="8">Đang tải voucher...</td></tr>
                ) : filteredVouchers.length ? (
                  filteredVouchers.map((voucher) => (
                    <tr key={voucher.rawId}>
                      <td>
                        <span className="voucher-code">{voucher.code}</span>
                      </td>
                      <td>
                        <div className="voucher-name">
                          <div className="voucher-icon">
                            <TicketPercent size={18} />
                          </div>
                          <div>
                            <strong>{voucher.name}</strong>
                            <span>{voucher.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong className="voucher-discount">{discountText(voucher)}</strong>
                      </td>
                      <td>{money(voucher.minOrderValue)}</td>
                      <td>
                        <span className="voucher-count">
                          {voucher.quantity} còn / {voucher.usedCount} dùng
                        </span>
                      </td>
                      <td>
                        <div className="voucher-date">
                          <span>{voucher.startsAt}</span>
                          <span>{voucher.endsAt}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`voucher-status ${voucher.statusValue}`}>
                          {voucher.status}
                        </span>
                      </td>
                      <td>
                        <div className="voucher-actions">
                          <button aria-label={`Sửa ${voucher.code}`} className="voucher-action edit" onClick={() => openEditModal(voucher)} title="Sửa" type="button">
                            <Pencil size={16} />
                          </button>
                          <button aria-label={`Xóa ${voucher.code}`} className="voucher-action delete" disabled={deletingId !== null} onClick={() => void handleDelete(voucher)} title="Xóa / tạm ngưng" type="button">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="voucher-empty" colSpan="8">
                      Không tìm thấy voucher
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="voucher-modal-overlay" onClick={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <div aria-labelledby="voucher-modal-title" aria-modal="true" className="voucher-modal" onKeyDown={(event) => { if (event.key === "Escape") closeModal(); }} role="dialog">
            <div className="voucher-modal-header">
              <div>
                <h2 id="voucher-modal-title">{editingVoucher ? "Chỉnh sửa voucher" : "Thêm voucher"}</h2>
              </div>

              <button aria-label="Đóng" className="voucher-modal-close" disabled={saving} onClick={closeModal} title="Đóng" type="button">
                <X size={19} />
              </button>
            </div>

            <form className="voucher-form" onSubmit={handleSubmit}>
              {formError ? <p className="voucher-error" role="alert">{formError}</p> : null}
              <fieldset disabled={saving}>
              <div className="voucher-form-row">
                <Field label="Mã voucher" required>
                  <input autoFocus maxLength={50} name="code" onChange={handleChange} pattern="[A-Za-z0-9_-]+" placeholder="VD: VOLLEY50" required value={form.code} />
                </Field>
                <Field label="Trạng thái">
                  <select name="status" onChange={handleChange} value={form.status}>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Tên chương trình" required>
                <input maxLength={150} name="name" onChange={handleChange} placeholder="Giảm giá khai trương" required value={form.name} />
              </Field>

              <div className="voucher-form-row">
                <Field label="Kiểu giảm">
                  <select name="discountType" onChange={handleChange} value={form.discountType}>
                    <option value="tien_mat">Tiền mặt</option>
                    <option value="phan_tram">Phần trăm</option>
                  </select>
                </Field>
                <Field label="Giá trị giảm" required>
                  <input max={form.discountType === "phan_tram" ? 100 : undefined} min="0.01" name="discountValue" onChange={handleChange} required step="0.01" type="number" value={form.discountValue} />
                </Field>
              </div>

              <div className="voucher-form-row">
                <Field label="Đơn tối thiểu">
                  <input min="0" name="minOrderValue" onChange={handleChange} type="number" value={form.minOrderValue} />
                </Field>
                <Field label="Mức giảm tối đa">
                  <input min="0" name="maxDiscount" onChange={handleChange} placeholder="Để trống nếu không giới hạn" type="number" value={form.maxDiscount} />
                </Field>
              </div>

              <div className="voucher-form-row">
                <Field label="Số lượt còn lại">
                  <input max="2147483647" min="0" name="quantity" onChange={handleChange} required step="1" type="number" value={form.quantity} />
                </Field>
                <Field label="Bắt đầu">
                  <input name="startsAt" onChange={handleChange} required type="datetime-local" value={form.startsAt} />
                </Field>
              </div>

              <Field label="Kết thúc">
                <input name="endsAt" onChange={handleChange} required type="datetime-local" value={form.endsAt} />
              </Field>

              <div className="voucher-modal-footer">
                <button className="voucher-btn-cancel" onClick={closeModal} type="button">Hủy</button>
                <button className="voucher-btn-save" disabled={saving} type="submit">
                  {saving ? "Đang lưu..." : editingVoucher ? "Cập nhật" : "Thêm voucher"}
                </button>
              </div>
              </fieldset>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ children, label, required = false }) {
  return (
    <div className="voucher-form-group">
      <label htmlFor={`voucher-${children.props.name}`}>
        {label}
        {required ? <span>*</span> : null}
      </label>
      {cloneElement(children, { id: `voucher-${children.props.name}` })}
    </div>
  );
}

function StatCard({ icon, label, tone = "", value }) {
  return (
    <div className="voucher-stat-card">
      <div className={`voucher-stat-icon ${tone}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
