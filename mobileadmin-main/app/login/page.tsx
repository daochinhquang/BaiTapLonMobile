"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import styles from "./page.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        body: JSON.stringify({ identifier: identifier.trim(), password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message || "Đăng nhập không thành công.");
        return;
      }

      router.replace("/admin");
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel} aria-label="ELIP SPORT">
        <div className={styles.brand}>
          <span className={styles.brandMark}>E</span>
          <span>
            ELIP <strong>SPORT</strong>
          </span>
        </div>
        <div className={styles.brandMessage}>
          <span className={styles.overline}>CONTROL ROOM / 01</span>
          <h1>
            Vận hành
            <br />
            <em>thể thao.</em>
          </h1>
          <div className={styles.signal} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
        <span className={styles.panelFooter}>
          ELIP SPORT <span>ADMINISTRATION</span>
        </span>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.formWrap}>
          <div className={styles.formIcon}>
            <ShieldCheck size={20} strokeWidth={1.8} />
          </div>
          <p className={styles.formEyebrow}>KHU VỰC QUẢN TRỊ</p>
          <h2>Đăng nhập</h2>
          <p className={styles.formIntro}>
            Dành riêng cho tài khoản quản trị viên.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label htmlFor="identifier">Email hoặc số điện thoại</label>
            <input
              autoComplete="username"
              autoCapitalize="none"
              id="identifier"
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Nhập tài khoản"
              required
              value={identifier}
            />

            <label htmlFor="password">Mật khẩu</label>
            <input
              autoComplete="current-password"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nhập mật khẩu"
              required
              type="password"
              value={password}
            />

            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}

            <button className={styles.submit} disabled={loading} type="submit">
              <span>{loading ? "Đang xác thực..." : "Vào trang quản trị"}</span>
              <ArrowRight size={18} />
            </button>
          </form>
          <p className={styles.securityNote}>
            Phiên đăng nhập được bảo vệ và tự hết hạn sau 8 giờ.
          </p>
        </div>
      </section>
    </main>
  );
}
