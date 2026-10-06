"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  ShieldCheck,
  UserRound,
  Lock,
  Unlock,
} from "lucide-react";

import { adminApi } from "@/lib/adminApi";

const initialAccounts = [
  {
    id: "TK001",
    username: "admin",
    name: "Quản trị viên",
    email: "admin@elipsport.vn",
    role: "Admin",
    date: "01/01/2026",
    status: "Đang hoạt động",
  },
  {
    id: "TK002",
    username: "nguyenvana",
    name: "Nguyễn Văn An",
    email: "nguyenvana@elipsport.vn",
    role: "Nhân viên",
    date: "05/01/2026",
    status: "Đang hoạt động",
  },
  {
    id: "TK003",
    username: "tranminhduc",
    name: "Trần Minh Đức",
    email: "tranminhduc@elipsport.vn",
    role: "Nhân viên",
    date: "12/01/2026",
    status: "Đang hoạt động",
  },
  {
    id: "TK004",
    username: "lethihuong",
    name: "Lê Thị Hương",
    email: "lethihuong@elipsport.vn",
    role: "Nhân viên",
    date: "20/02/2026",
    status: "Đã khóa",
  },
  {
    id: "TK005",
    username: "phamnam",
    name: "Phạm Văn Nam",
    email: "phamnam@elipsport.vn",
    role: "Quản lý",
    date: "02/03/2026",
    status: "Đang hoạt động",
  },
];

export default function TaiKhoanPage() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tất cả");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);

  async function loadAccounts() {
    try {
      setAccounts(await adminApi.accounts.list());
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    adminApi.accounts.list()
      .then(setAccounts)
      .catch((error) => alert(error.message));
  }, []);

  function openAddAccount() {
    setEditingAccount({
      email: "",
      id: "Tài khoản mới",
      name: "",
      password: "",
      phone: "",
      rawId: null,
      role: "Admin",
      status: "Đang hoạt động",
      username: "",
    });
  }

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        account.username.toLowerCase().includes(keyword) ||
        account.name.toLowerCase().includes(keyword) ||
        account.email.toLowerCase().includes(keyword);

      const matchRole =
        roleFilter === "Tất cả" ||
        account.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [accounts, search, roleFilter]);

  const active = accounts.filter(
    (a) => a.status === "Đang hoạt động"
  ).length;

  const locked = accounts.filter(
    (a) => a.status === "Đã khóa"
  ).length;

  const admins = accounts.filter(
    (a) => a.role === "Admin"
  ).length;

  const toggleStatus = async (id) => {
    const account = accounts.find((item) => item.id === id);
    if (!account) return;
    const updated = {
      ...account,
      status: account.status === "Đã khóa" ? "Đang hoạt động" : "Đã khóa",
    };
    try {
      await adminApi.accounts.update(account.rawId, updated);
      setAccounts((current) => current.map((item) => item.id === id ? updated : item));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    const account = accounts.find((a) => a.id === id);

    if (
      window.confirm(
        `Bạn có chắc muốn xóa tài khoản ${account.username}?`
      )
    ) {
      try {
        await adminApi.accounts.delete(account.rawId);
        setAccounts((current) => current.filter((a) => a.id !== id));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleSave = async () => {
    if (!editingAccount.name.trim() || !editingAccount.email.trim()) {
      alert("Vui lòng nhập họ tên và email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingAccount.email.trim())) {
      alert("Vui lòng nhập email hợp lệ.");
      return;
    }
    setSaving(true);
    try {
      if (editingAccount.rawId) {
        await adminApi.accounts.update(editingAccount.rawId, editingAccount);
      } else {
        await adminApi.accounts.create(editingAccount);
      }
      await loadAccounts();
      setEditingAccount(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <link rel="stylesheet" href="/css/tai-khoan.css" />

      <div className="account-management">

        <div className="account-page-header">
          <div>
            <h1>Quản lý tài khoản</h1>
            <p>
              Quản lý tài khoản đăng nhập và phân quyền hệ thống
            </p>
          </div>

          <button className="account-primary-btn" onClick={openAddAccount}>
            <Plus size={18} />
            Thêm tài khoản
          </button>
        </div>

        <div className="account-stat-grid">

          <div className="account-stat-card">
            <div className="account-stat-icon total">
              <UserRound size={22} />
            </div>
            <div>
              <span>Tổng tài khoản</span>
              <strong>{accounts.length}</strong>
            </div>
          </div>

          <div className="account-stat-card">
            <div className="account-stat-icon active">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span>Đang hoạt động</span>
              <strong>{active}</strong>
            </div>
          </div>

          <div className="account-stat-card">
            <div className="account-stat-icon locked">
              <Lock size={22} />
            </div>
            <div>
              <span>Đã khóa</span>
              <strong>{locked}</strong>
            </div>
          </div>

          <div className="account-stat-card">
            <div className="account-stat-icon admin">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span>Quản trị viên</span>
              <strong>{admins}</strong>
            </div>
          </div>

        </div>

        <div className="account-table-card">

          <div className="account-toolbar">

            <div className="account-search">
              <Search size={19} />

              <input
                placeholder="Tìm username, họ tên, email..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <select
              className="account-filter"
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value)
              }
            >
              <option>Tất cả</option>
              <option>Admin</option>
              <option>Khách hàng</option>
            </select>

          </div>

          <div className="account-table-wrapper">

            <table className="account-table">

              <thead>
                <tr>
                  <th>Mã TK</th>
                  <th>Tài khoản</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>

                {filteredAccounts.map((account) => (

                  <tr key={account.id}>

                    <td>
                      <span className="account-code">
                        {account.id}
                      </span>
                    </td>

                    <td>
                      <strong className="account-username">
                        {account.username}
                      </strong>
                    </td>

                    <td>{account.name}</td>

                    <td>{account.email}</td>

                    <td>
                      <span
                        className={`account-role ${account.role
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {account.role}
                      </span>
                    </td>

                    <td>{account.date}</td>

                    <td>
                      <span
                        className={
                          account.status === "Đã khóa"
                            ? "account-status locked"
                            : "account-status active"
                        }
                      >
                        {account.status}
                      </span>
                    </td>

                    <td>

                      <div className="account-actions">

                        <button
                          className="account-action view"
                          onClick={() =>
                            setSelectedAccount(account)
                          }
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          className="account-action edit"
                          onClick={() =>
                            setEditingAccount(account)
                          }
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="account-action lock"
                          title={
                            account.status === "Đã khóa"
                              ? "Mở khóa"
                              : "Khóa tài khoản"
                          }
                          onClick={() =>
                            toggleStatus(account.id)
                          }
                        >
                          {account.status === "Đã khóa" ? (
                            <Unlock size={17} />
                          ) : (
                            <Lock size={17} />
                          )}
                        </button>

                        <button
                          className="account-action delete"
                          onClick={() =>
                            handleDelete(account.id)
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

          <div className="account-footer">
            Hiển thị{" "}
            <strong>{filteredAccounts.length}</strong>{" "}
            / {accounts.length} tài khoản
          </div>

        </div>

        {/* DETAIL */}
        {selectedAccount && (
          <div
            className="account-modal-overlay"
            onClick={() => setSelectedAccount(null)}
          >

            <div
              className="account-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="account-modal-header">
                <div>
                  <h2>Thông tin tài khoản</h2>
                  <span>{selectedAccount.id}</span>
                </div>

                <button
                  onClick={() =>
                    setSelectedAccount(null)
                  }
                >
                  <X size={20} />
                </button>
              </div>

              <div className="account-detail">

                <div className="account-big-icon">
                  <UserRound size={32} />
                </div>

                <h3>{selectedAccount.name}</h3>

                <span className="account-username-large">
                  @{selectedAccount.username}
                </span>

                <div className="account-detail-info">

                  <div>
                    <span>Email</span>
                    <strong>
                      {selectedAccount.email}
                    </strong>
                  </div>

                  <div>
                    <span>Vai trò</span>
                    <strong>
                      {selectedAccount.role}
                    </strong>
                  </div>

                  <div>
                    <span>Ngày tạo</span>
                    <strong>
                      {selectedAccount.date}
                    </strong>
                  </div>

                  <div>
                    <span>Trạng thái</span>
                    <strong>
                      {selectedAccount.status}
                    </strong>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* EDIT */}
        {editingAccount && (
          <div
            className="account-modal-overlay"
            onClick={() => setEditingAccount(null)}
          >

            <div
              className="account-edit-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="account-modal-header">
                <div>
                  <h2>{editingAccount.rawId ? "Chỉnh sửa tài khoản" : "Thêm tài khoản"}</h2>
                  <span>{editingAccount.id}</span>
                </div>

                <button
                  onClick={() =>
                    setEditingAccount(null)
                  }
                >
                  <X size={20} />
                </button>
              </div>

              <div className="account-form">

                <label htmlFor="account-email">Email</label>
                <input
                  id="account-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={editingAccount.email}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      email: e.target.value,
                    })
                  }
                  placeholder="Nhập email"
                />

                <label>Họ tên</label>
                <input
                  value={editingAccount.name}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      name: e.target.value,
                    })
                  }
                />

                <label>Số điện thoại</label>
                <input
                  value={editingAccount.phone || ""}
                  onChange={(e) => setEditingAccount({ ...editingAccount, phone: e.target.value })}
                />

                {!editingAccount.rawId && (
                  <>
                    <label>Mật khẩu</label>
                    <input
                      type="password"
                      value={editingAccount.password}
                      onChange={(e) => setEditingAccount({ ...editingAccount, password: e.target.value })}
                      placeholder="Ít nhất 6 ký tự"
                    />
                  </>
                )}

                <label>Vai trò</label>
                <select
                  value={editingAccount.role}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      role: e.target.value,
                    })
                  }
                >
                  <option>Admin</option>
                  <option>Khách hàng</option>
                </select>

              </div>

              <div className="account-form-actions">

                <button
                  className="account-cancel-btn"
                  onClick={() =>
                    setEditingAccount(null)
                  }
                >
                  Hủy
                </button>

                <button
                  className="account-primary-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : editingAccount.rawId ? "Lưu thay đổi" : "Thêm tài khoản"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </>
  );
}
