CREATE DATABASE IF NOT EXISTS AppBanBongChuyen
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE AppBanBongChuyen;

CREATE TABLE NguoiDung (
    MaNguoiDung INT AUTO_INCREMENT PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    SoDienThoai VARCHAR(20) UNIQUE,
    MatKhau VARCHAR(255) NOT NULL,
    AnhDaiDien LONGTEXT,
    GioiTinh VARCHAR(20),
    NgaySinh VARCHAR(20),
    VaiTro VARCHAR(20) NOT NULL DEFAULT 'user',
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'active',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT CK_NguoiDung_VaiTro CHECK (VaiTro IN ('user', 'admin')),
    CONSTRAINT CK_NguoiDung_TrangThai CHECK (TrangThai IN ('active', 'locked'))
) ENGINE=InnoDB;

CREATE TABLE DanhMuc (
    MaDanhMuc INT AUTO_INCREMENT PRIMARY KEY,
    TenDanhMuc VARCHAR(100) NOT NULL UNIQUE,
    MoTa TEXT,
    HinhAnh VARCHAR(255),
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'active',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT CK_DanhMuc_TrangThai CHECK (TrangThai IN ('active', 'inactive'))
) ENGINE=InnoDB;

CREATE TABLE NhaCungCap (
    MaNhaCungCap INT AUTO_INCREMENT PRIMARY KEY,
    TenNhaCungCap VARCHAR(150) NOT NULL,
    NguoiLienHe VARCHAR(100),
    SoDienThoai VARCHAR(20) NOT NULL,
    Email VARCHAR(150) UNIQUE,
    DiaChi TEXT,
    MaSoThue VARCHAR(50) UNIQUE,
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'active',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT CK_NhaCungCap_TrangThai CHECK (TrangThai IN ('active', 'inactive'))
) ENGINE=InnoDB;

CREATE TABLE MaGiamGia (
    MaGiamGia INT AUTO_INCREMENT PRIMARY KEY,
    MaCode VARCHAR(50) NOT NULL UNIQUE,
    TenMaGiamGia VARCHAR(150) NOT NULL,
    LoaiGiam VARCHAR(20) NOT NULL,
    GiaTriGiam DECIMAL(15,2) NOT NULL,
    GiaTriDonHangToiThieu DECIMAL(15,2) NOT NULL DEFAULT 0,
    MucGiamToiDa DECIMAL(15,2),
    SoLuong INT NOT NULL DEFAULT 0,
    NgayBatDau DATETIME NOT NULL,
    NgayKetThuc DATETIME NOT NULL,
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'active',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT CK_MaGiamGia_LoaiGiam CHECK (LoaiGiam IN ('phan_tram', 'tien_mat')),
    CONSTRAINT CK_MaGiamGia_GiaTriGiam CHECK (GiaTriGiam > 0),
    CONSTRAINT CK_MaGiamGia_PhanTram CHECK (LoaiGiam <> 'phan_tram' OR GiaTriGiam <= 100),
    CONSTRAINT CK_MaGiamGia_GiaTriDonHangToiThieu CHECK (GiaTriDonHangToiThieu >= 0),
    CONSTRAINT CK_MaGiamGia_MucGiamToiDa CHECK (MucGiamToiDa IS NULL OR MucGiamToiDa >= 0),
    CONSTRAINT CK_MaGiamGia_SoLuong CHECK (SoLuong >= 0),
    CONSTRAINT CK_MaGiamGia_Ngay CHECK (NgayKetThuc > NgayBatDau),
    CONSTRAINT CK_MaGiamGia_TrangThai CHECK (TrangThai IN ('active', 'inactive', 'expired'))
) ENGINE=InnoDB;

CREATE TABLE LoaiSanPham (
    MaLoaiSanPham INT AUTO_INCREMENT PRIMARY KEY,
    MaDanhMuc INT NOT NULL,
    TenLoaiSanPham VARCHAR(100) NOT NULL,
    MoTa TEXT,
    HinhAnh VARCHAR(255),
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'active',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_LoaiSanPham_DanhMuc_Ten UNIQUE (MaDanhMuc, TenLoaiSanPham),
    CONSTRAINT CK_LoaiSanPham_TrangThai CHECK (TrangThai IN ('active', 'inactive')),
    CONSTRAINT FK_LoaiSanPham_DanhMuc FOREIGN KEY (MaDanhMuc)
        REFERENCES DanhMuc(MaDanhMuc)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE SanPham (
    MaSanPham INT AUTO_INCREMENT PRIMARY KEY,
    MaLoaiSanPham INT NOT NULL,
    MaNhaCungCap INT NOT NULL,
    TenSanPham VARCHAR(150) NOT NULL,
    ThuongHieu VARCHAR(100),
    GiaBan DECIMAL(15,2) NOT NULL,
    SoLuongTon INT NOT NULL DEFAULT 0,
    MoTa TEXT,
    AnhDaiDien LONGTEXT,
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'active',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX IDX_SanPham_MaLoaiSanPham (MaLoaiSanPham),
    INDEX IDX_SanPham_MaNhaCungCap (MaNhaCungCap),
    CONSTRAINT CK_SanPham_GiaBan CHECK (GiaBan >= 0),
    CONSTRAINT CK_SanPham_SoLuongTon CHECK (SoLuongTon >= 0),
    CONSTRAINT CK_SanPham_TrangThai CHECK (TrangThai IN ('active', 'inactive', 'out_of_stock')),
    CONSTRAINT FK_SanPham_LoaiSanPham FOREIGN KEY (MaLoaiSanPham)
        REFERENCES LoaiSanPham(MaLoaiSanPham)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT FK_SanPham_NhaCungCap FOREIGN KEY (MaNhaCungCap)
        REFERENCES NhaCungCap(MaNhaCungCap)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE BienTheSanPham (
    MaBienThe INT AUTO_INCREMENT PRIMARY KEY,
    MaSanPham INT NOT NULL,
    KichThuoc VARCHAR(50) NOT NULL DEFAULT '',
    MauSac VARCHAR(80) NOT NULL DEFAULT '',
    GiaBan DECIMAL(15,2) NOT NULL,
    SoLuongTon INT NOT NULL DEFAULT 0,
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'active',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_BienTheSanPham_SanPham_Size_Color UNIQUE (MaSanPham, KichThuoc, MauSac),
    CONSTRAINT CK_BienTheSanPham_GiaBan CHECK (GiaBan >= 0),
    CONSTRAINT CK_BienTheSanPham_SoLuongTon CHECK (SoLuongTon >= 0),
    CONSTRAINT CK_BienTheSanPham_TrangThai CHECK (TrangThai IN ('active', 'inactive', 'out_of_stock')),
    CONSTRAINT FK_BienTheSanPham_SanPham FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE HinhAnhSanPham (
    MaHinhAnh INT AUTO_INCREMENT PRIMARY KEY,
    MaSanPham INT NOT NULL,
    DuongDanHinhAnh VARCHAR(255) NOT NULL,
    LaAnhChinh BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT UQ_HinhAnhSanPham_DuongDan UNIQUE (MaSanPham, DuongDanHinhAnh),
    CONSTRAINT FK_HinhAnhSanPham_SanPham FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE PhieuNhap (
    MaPhieuNhap INT AUTO_INCREMENT PRIMARY KEY,
    MaNhaCungCap INT NOT NULL,
    MaAdmin INT NOT NULL,
    NgayNhap DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TongTien DECIMAL(15,2) NOT NULL DEFAULT 0,
    GhiChu TEXT,
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'completed',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX IDX_PhieuNhap_MaNhaCungCap (MaNhaCungCap),
    INDEX IDX_PhieuNhap_MaAdmin (MaAdmin),
    CONSTRAINT CK_PhieuNhap_TongTien CHECK (TongTien >= 0),
    CONSTRAINT CK_PhieuNhap_TrangThai CHECK (TrangThai IN ('draft', 'completed', 'cancelled')),
    CONSTRAINT FK_PhieuNhap_NhaCungCap FOREIGN KEY (MaNhaCungCap)
        REFERENCES NhaCungCap(MaNhaCungCap)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT FK_PhieuNhap_Admin FOREIGN KEY (MaAdmin)
        REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ChiTietPhieuNhap (
    MaChiTietPhieuNhap INT AUTO_INCREMENT PRIMARY KEY,
    MaPhieuNhap INT NOT NULL,
    MaSanPham INT NOT NULL,
    MaBienThe INT NOT NULL,
    SoLuong INT NOT NULL,
    GiaNhap DECIMAL(15,2) NOT NULL,
    ThanhTien DECIMAL(15,2) GENERATED ALWAYS AS (SoLuong * GiaNhap) STORED,
    CONSTRAINT UQ_ChiTietPhieuNhap_PhieuNhap_BienThe UNIQUE (MaPhieuNhap, MaBienThe),
    CONSTRAINT CK_ChiTietPhieuNhap_SoLuong CHECK (SoLuong > 0),
    CONSTRAINT CK_ChiTietPhieuNhap_GiaNhap CHECK (GiaNhap >= 0),
    CONSTRAINT FK_ChiTietPhieuNhap_PhieuNhap FOREIGN KEY (MaPhieuNhap)
        REFERENCES PhieuNhap(MaPhieuNhap)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT FK_ChiTietPhieuNhap_SanPham FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT FK_ChiTietPhieuNhap_BienThe FOREIGN KEY (MaBienThe)
        REFERENCES BienTheSanPham(MaBienThe)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE GioHang (
    MaGioHang INT AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT NOT NULL UNIQUE,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_GioHang_NguoiDung FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ChiTietGioHang (
    MaChiTietGioHang INT AUTO_INCREMENT PRIMARY KEY,
    MaGioHang INT NOT NULL,
    MaSanPham INT NOT NULL,
    MaBienThe INT NOT NULL,
    SoLuong INT NOT NULL DEFAULT 1,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT UQ_ChiTietGioHang_GioHang_BienThe UNIQUE (MaGioHang, MaBienThe),
    CONSTRAINT CK_ChiTietGioHang_SoLuong CHECK (SoLuong > 0),
    CONSTRAINT FK_ChiTietGioHang_GioHang FOREIGN KEY (MaGioHang)
        REFERENCES GioHang(MaGioHang)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FK_ChiTietGioHang_SanPham FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FK_ChiTietGioHang_BienThe FOREIGN KEY (MaBienThe)
        REFERENCES BienTheSanPham(MaBienThe)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE DiaChi (
    MaDiaChi INT AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    TenNguoiNhan VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(20) NOT NULL,
    TinhThanh VARCHAR(100) NOT NULL,
    QuanHuyen VARCHAR(100) NOT NULL,
    PhuongXa VARCHAR(100) NOT NULL,
    DiaChiChiTiet VARCHAR(255) NOT NULL,
    MacDinh BOOLEAN NOT NULL DEFAULT FALSE,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX IDX_DiaChi_MaNguoiDung (MaNguoiDung),
    CONSTRAINT FK_DiaChi_NguoiDung FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE NguoiDungMaGiamGia (
    MaNguoiDungMaGiamGia INT AUTO_INCREMENT PRIMARY KEY,
    MaGiamGia INT NOT NULL,
    MaNguoiDung INT NOT NULL,
    DaSuDung BOOLEAN NOT NULL DEFAULT FALSE,
    NgaySuDung DATETIME,
    CONSTRAINT UQ_NguoiDungMaGiamGia UNIQUE (MaGiamGia, MaNguoiDung),
    CONSTRAINT FK_NguoiDungMaGiamGia_MaGiamGia FOREIGN KEY (MaGiamGia)
        REFERENCES MaGiamGia(MaGiamGia)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT FK_NguoiDungMaGiamGia_NguoiDung FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE DonHang (
    MaDonHang INT AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    MaDiaChi INT NOT NULL,
    MaGiamGia INT NULL,
    TongTienHang DECIMAL(15,2) NOT NULL DEFAULT 0,
    SoTienGiam DECIMAL(15,2) NOT NULL DEFAULT 0,
    PhiVanChuyen DECIMAL(15,2) NOT NULL DEFAULT 0,
    TongThanhToan DECIMAL(15,2) NOT NULL DEFAULT 0,
    PhuongThucThanhToan VARCHAR(30) NOT NULL,
    TrangThaiThanhToan VARCHAR(20) NOT NULL DEFAULT 'unpaid',
    TrangThaiDonHang VARCHAR(20) NOT NULL DEFAULT 'pending',
    GhiChu TEXT,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX IDX_DonHang_MaNguoiDung (MaNguoiDung),
    INDEX IDX_DonHang_MaDiaChi (MaDiaChi),
    INDEX IDX_DonHang_MaGiamGia (MaGiamGia),
    CONSTRAINT CK_DonHang_TongTienHang CHECK (TongTienHang >= 0),
    CONSTRAINT CK_DonHang_SoTienGiam CHECK (SoTienGiam >= 0),
    CONSTRAINT CK_DonHang_PhiVanChuyen CHECK (PhiVanChuyen >= 0),
    CONSTRAINT CK_DonHang_TongThanhToan CHECK (TongThanhToan >= 0),
    CONSTRAINT CK_DonHang_PhuongThucThanhToan CHECK (PhuongThucThanhToan IN ('COD', 'VNPay', 'MoMo', 'ChuyenKhoan')),
    CONSTRAINT CK_DonHang_TrangThaiThanhToan CHECK (TrangThaiThanhToan IN ('unpaid', 'paid', 'failed', 'refunded')),
    CONSTRAINT CK_DonHang_TrangThaiDonHang CHECK (TrangThaiDonHang IN ('pending', 'confirmed', 'shipping', 'completed', 'cancelled')),
    CONSTRAINT FK_DonHang_NguoiDung FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT FK_DonHang_DiaChi FOREIGN KEY (MaDiaChi)
        REFERENCES DiaChi(MaDiaChi)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT FK_DonHang_MaGiamGia FOREIGN KEY (MaGiamGia)
        REFERENCES MaGiamGia(MaGiamGia)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ChiTietDonHang (
    MaChiTietDonHang INT AUTO_INCREMENT PRIMARY KEY,
    MaDonHang INT NOT NULL,
    MaSanPham INT NOT NULL,
    MaBienThe INT NOT NULL,
    SoLuong INT NOT NULL,
    DonGia DECIMAL(15,2) NOT NULL,
    KichThuoc VARCHAR(50) NOT NULL DEFAULT '',
    MauSac VARCHAR(80) NOT NULL DEFAULT '',
    ThanhTien DECIMAL(15,2) GENERATED ALWAYS AS (SoLuong * DonGia) STORED,
    CONSTRAINT UQ_ChiTietDonHang_DonHang_BienThe UNIQUE (MaDonHang, MaBienThe),
    CONSTRAINT CK_ChiTietDonHang_SoLuong CHECK (SoLuong > 0),
    CONSTRAINT CK_ChiTietDonHang_DonGia CHECK (DonGia >= 0),
    CONSTRAINT FK_ChiTietDonHang_DonHang FOREIGN KEY (MaDonHang)
        REFERENCES DonHang(MaDonHang)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT FK_ChiTietDonHang_SanPham FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT FK_ChiTietDonHang_BienThe FOREIGN KEY (MaBienThe)
        REFERENCES BienTheSanPham(MaBienThe)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ThanhToan (
    MaThanhToan INT AUTO_INCREMENT PRIMARY KEY,
    MaDonHang INT NOT NULL UNIQUE,
    PhuongThucThanhToan VARCHAR(30) NOT NULL,
    MaGiaoDich VARCHAR(100) UNIQUE,
    SoTien DECIMAL(15,2) NOT NULL,
    TrangThaiThanhToan VARCHAR(20) NOT NULL DEFAULT 'unpaid',
    NgayThanhToan DATETIME,
    CONSTRAINT CK_ThanhToan_PhuongThucThanhToan CHECK (PhuongThucThanhToan IN ('COD', 'VNPay', 'MoMo', 'ChuyenKhoan')),
    CONSTRAINT CK_ThanhToan_SoTien CHECK (SoTien >= 0),
    CONSTRAINT CK_ThanhToan_TrangThaiThanhToan CHECK (TrangThaiThanhToan IN ('unpaid', 'paid', 'failed', 'refunded')),
    CONSTRAINT FK_ThanhToan_DonHang FOREIGN KEY (MaDonHang)
        REFERENCES DonHang(MaDonHang)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE DanhGia (
    MaDanhGia INT AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    MaSanPham INT NOT NULL,
    MaDonHang INT NOT NULL,
    SoSao INT NOT NULL,
    NoiDung TEXT,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'visible',
    CONSTRAINT UQ_DanhGia_NguoiDung_SanPham_DonHang UNIQUE (MaNguoiDung, MaSanPham, MaDonHang),
    CONSTRAINT CK_DanhGia_SoSao CHECK (SoSao BETWEEN 1 AND 5),
    CONSTRAINT CK_DanhGia_TrangThai CHECK (TrangThai IN ('visible', 'hidden')),
    CONSTRAINT FK_DanhGia_NguoiDung FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT FK_DanhGia_SanPham FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT FK_DanhGia_DonHang FOREIGN KEY (MaDonHang)
        REFERENCES DonHang(MaDonHang)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE YeuThich (
    MaYeuThich INT AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT NOT NULL,
    MaSanPham INT NOT NULL,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UQ_YeuThich_NguoiDung_SanPham UNIQUE (MaNguoiDung, MaSanPham),
    CONSTRAINT FK_YeuThich_NguoiDung FOREIGN KEY (MaNguoiDung)
        REFERENCES NguoiDung(MaNguoiDung)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FK_YeuThich_SanPham FOREIGN KEY (MaSanPham)
        REFERENCES SanPham(MaSanPham)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, VaiTro, TrangThai)
VALUES
('Quan tri vien', 'admin@bongchuyen.vn', '0900000001', '$2y$10$HashMatKhauAdminViDu', 'admin', 'active'),
('Nguyen Van An', 'an.nguyen@example.com', '0900000002', '$2y$10$HashMatKhauUserAnViDu', 'user', 'active'),
('Tran Thi Binh', 'binh.tran@example.com', '0900000003', '$2y$10$HashMatKhauUserBinhViDu', 'user', 'active');

INSERT INTO DanhMuc (TenDanhMuc, MoTa, HinhAnh, TrangThai)
VALUES
('Bóng chuyền', 'Các loại bóng chuyền thi đấu và luyện tập', '/images/danh-muc/bong-chuyen.jpg', 'active'),
('Giày bóng chuyền', 'Giày chuyên dụng cho bóng chuyền trong nhà và ngoài trời', '/images/danh-muc/giay-bong-chuyen.jpg', 'active'),
('Phụ kiện', 'Băng gối, băng cổ tay, túi đựng bóng và phụ kiện khác', '/images/danh-muc/phu-kien.jpg', 'active');

INSERT INTO LoaiSanPham (MaDanhMuc, TenLoaiSanPham, MoTa, HinhAnh, TrangThai)
VALUES
(1, 'Bóng thi đấu', 'Bóng đạt chuẩn dùng trong thi đấu', '/images/loai/bong-thi-dau.jpg', 'active'),
(1, 'Bóng luyện tập', 'Bóng dùng cho tập luyện hằng ngày', '/images/loai/bong-luyen-tap.jpg', 'active'),
(2, 'Giày trong nhà', 'Giày bóng chuyền dùng cho sân trong nhà', '/images/loai/giay-trong-nha.jpg', 'active');

INSERT INTO NhaCungCap (TenNhaCungCap, NguoiLienHe, SoDienThoai, Email, DiaChi, MaSoThue, TrangThai)
VALUES
('Cong ty The thao Minh Phat', 'Le Minh', '0911111111', 'minhphat@supplier.vn', 'Quan 1, TP Ho Chi Minh', 'MST001', 'active'),
('Dai ly Bong chuyen Hoa Sen', 'Pham Hoa', '0922222222', 'hoasen@supplier.vn', 'Quan Hai Ba Trung, Ha Noi', 'MST002', 'active'),
('Nha phan phoi SportPro', 'Tran Nam', '0933333333', 'sportpro@supplier.vn', 'Quan Ninh Kieu, Can Tho', 'MST003', 'active');

INSERT INTO SanPham (MaLoaiSanPham, MaNhaCungCap, TenSanPham, ThuongHieu, GiaBan, SoLuongTon, MoTa, AnhDaiDien, TrangThai)
VALUES
(1, 1, 'Bóng chuyền Mikasa V200W', 'Mikasa', 1890000.00, 20, 'Bóng thi đấu tiêu chuẩn, độ nảy ổn định', '/images/san-pham/mikasa-v200w.jpg', 'active'),
(2, 2, 'Bóng chuyền tập luyện Thăng Long TL01', 'Thang Long', 350000.00, 50, 'Bóng tập luyện bền, phù hợp học sinh sinh viên', '/images/san-pham/thang-long-tl01.jpg', 'active'),
(3, 3, 'Giày bóng chuyền Asics Gel Rocket 11', 'Asics', 1650000.00, 15, 'Giày sân trong nhà, bám sân tốt', '/images/san-pham/asics-gel-rocket-11.jpg', 'active');

INSERT INTO BienTheSanPham (MaSanPham, KichThuoc, MauSac, GiaBan, SoLuongTon, TrangThai)
VALUES
(1, '5', 'Vàng xanh', 1890000.00, 20, 'active'),
(2, '5', 'Vàng xanh', 350000.00, 50, 'active'),
(3, '40', 'Trắng xanh', 1650000.00, 8, 'active'),
(3, '41', 'Trắng xanh', 1650000.00, 7, 'active');
