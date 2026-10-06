"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, PackageSearch, RefreshCw, Search, ShoppingBag } from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import styles from "./page.module.css";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  image?: string;
  brand?: string;
  variants?: { id: number; size: string; color: string; price: number; stock: number }[];
};

function formatPrice(price: number) {
  return `${new Intl.NumberFormat("vi-VN").format(price)}đ`;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const result = await adminApi.products.list();
        if (active) {
          setProducts(result as Product[]);
          setError("");
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Không thể tải danh sách sản phẩm."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") loadProducts();
    }

    loadProducts();
    const intervalId = window.setInterval(refreshWhenVisible, 30_000);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [reloadKey]);

  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean))
  );
  const visibleProducts = products.filter((product) => {
    const query = search.trim().toLocaleLowerCase("vi");
    const matchesSearch =
      !query ||
      product.name.toLocaleLowerCase("vi").includes(query) ||
      product.id.toLocaleLowerCase("vi").includes(query) ||
      (product.brand || "").toLocaleLowerCase("vi").includes(query);
    return matchesSearch && (category === "Tất cả" || product.category === category);
  });

  return (
    <main className={styles.store}>
      <header className={styles.header}>
        <Link aria-label="ELIP SPORT, trang chủ" className={styles.brand} href="/">
          <span className={styles.brandMark}>E</span>
          <span>ELIP <b>SPORT</b></span>
        </Link>
        <nav aria-label="Điều hướng chính" className={styles.nav}>
          <a href="#products">Sản phẩm</a>
          <Link className={styles.adminLink} href="/admin">Quản trị <ArrowRight size={15} /></Link>
        </nav>
      </header>

      <section className={styles.intro}>
        <div className={styles.introCopy}>
          <span className={styles.kicker}><span /> THIẾT BỊ THỂ THAO CHÍNH HÃNG</span>
          <h1>Chọn đúng thiết bị.<br /><em>Bứt phá</em> mỗi ngày.</h1>
          <p>Khám phá những sản phẩm giúp bạn tập luyện chủ động, bền bỉ và hiệu quả hơn.</p>
          <a className={styles.shopLink} href="#products">Khám phá sản phẩm <ArrowRight size={17} /></a>
        </div>
        <div aria-hidden="true" className={styles.introArt}>
          <div className={styles.artLabel}>TRAIN<br />YOUR WAY</div>
          <div className={styles.artDisc}><ShoppingBag size={54} strokeWidth={1.15} /></div>
          <span className={styles.artIndex}>ELIP / 01</span>
        </div>
      </section>

      <section className={styles.catalog} id="products">
        <div className={styles.catalogHeading}>
          <div>
            <span className={styles.sectionKicker}>BỘ SƯU TẬP</span>
            <h2>Sản phẩm dành cho bạn</h2>
          </div>
          <span className={styles.productCount}>{visibleProducts.length} sản phẩm</span>
        </div>

        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <Search aria-hidden="true" size={18} />
            <input
              aria-label="Tìm sản phẩm"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên, mã hoặc thương hiệu..."
              type="search"
              value={search}
            />
          </label>
          <div className={styles.toolbarRight}>
            <label className={styles.categorySelect}>
              <span>Danh mục</span>
              <select onChange={(event) => setCategory(event.target.value)} value={category}>
                <option value="Tất cả">Tất cả sản phẩm</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <button
              aria-label="Làm mới danh sách sản phẩm"
              className={styles.refreshButton}
              onClick={() => {
                setLoading(true);
                setReloadKey((current) => current + 1);
              }}
              title="Làm mới"
              type="button"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorNotice} role="alert">
            <span>{error} Hãy kiểm tra máy chủ dữ liệu rồi thử tải lại.</span>
            <button onClick={() => setReloadKey((current) => current + 1)} type="button">Thử lại</button>
          </div>
        )}

        {loading ? (
          <div className={styles.emptyState}><PackageSearch size={30} /><p>Đang tải sản phẩm...</p></div>
        ) : visibleProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {visibleProducts.map((product) => (
              <article className={styles.productCard} key={product.id}>
                <div className={styles.productImage}>
                  <PackageSearch aria-hidden="true" className={styles.imageFallback} size={42} strokeWidth={1.2} />
                  {product.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={product.name}
                      loading="lazy"
                      onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
                      src={product.image}
                    />
                  )}
                  <span className={`${styles.stockBadge} ${product.stock === 0 ? styles.outOfStock : ""}`}>
                    {product.stock === 0 ? "Hết hàng" : product.status}
                  </span>
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.productMeta}><span>{product.category}</span><span>{product.id}</span></div>
                  <h3>{product.name}</h3>
                  {product.brand && <p className={styles.brandName}>{product.brand}</p>}
                  <div className={styles.cardFooter}>
                    <strong>{formatPrice(product.price)}</strong>
                    <span>{product.stock > 0 ? `Còn ${product.stock}` : "Tạm hết"}</span>
                  </div>
                  {Boolean(product.variants?.length) && (
                    <p className={styles.variantNote}>{product.variants?.length} tùy chọn kích cỡ / màu sắc</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <PackageSearch size={32} />
            <p>{products.length ? "Không tìm thấy sản phẩm phù hợp." : "Chưa có sản phẩm nào được đăng bán."}</p>
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        <span>ELIP SPORT <b>·</b> Tập luyện theo cách của bạn</span>
        <span>Danh mục được đồng bộ từ cửa hàng</span>
      </footer>
    </main>
  );
}
