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

INSERT INTO BienTheSanPham (MaSanPham, KichThuoc, MauSac, GiaBan, SoLuongTon, TrangThai)
SELECT MaSanPham, '', '', GiaBan, SoLuongTon, TrangThai
FROM SanPham;

ALTER TABLE ChiTietGioHang ADD COLUMN MaBienThe INT NULL AFTER MaSanPham;
UPDATE ChiTietGioHang ct
INNER JOIN BienTheSanPham bt ON bt.MaSanPham = ct.MaSanPham AND bt.KichThuoc = '' AND bt.MauSac = ''
SET ct.MaBienThe = bt.MaBienThe;
ALTER TABLE ChiTietGioHang MODIFY COLUMN MaBienThe INT NOT NULL;
ALTER TABLE ChiTietGioHang
    ADD CONSTRAINT UQ_ChiTietGioHang_GioHang_BienThe UNIQUE (MaGioHang, MaBienThe),
    ADD CONSTRAINT FK_ChiTietGioHang_BienThe FOREIGN KEY (MaBienThe)
        REFERENCES BienTheSanPham(MaBienThe)
        ON DELETE CASCADE
        ON UPDATE CASCADE;
ALTER TABLE ChiTietGioHang DROP INDEX UQ_ChiTietGioHang_GioHang_SanPham;

ALTER TABLE ChiTietDonHang
    ADD COLUMN MaBienThe INT NULL AFTER MaSanPham,
    ADD COLUMN KichThuoc VARCHAR(50) NOT NULL DEFAULT '' AFTER DonGia,
    ADD COLUMN MauSac VARCHAR(80) NOT NULL DEFAULT '' AFTER KichThuoc;
UPDATE ChiTietDonHang ct
INNER JOIN BienTheSanPham bt ON bt.MaSanPham = ct.MaSanPham AND bt.KichThuoc = '' AND bt.MauSac = ''
SET ct.MaBienThe = bt.MaBienThe;
ALTER TABLE ChiTietDonHang MODIFY COLUMN MaBienThe INT NOT NULL;
ALTER TABLE ChiTietDonHang
    ADD CONSTRAINT UQ_ChiTietDonHang_DonHang_BienThe UNIQUE (MaDonHang, MaBienThe),
    ADD CONSTRAINT FK_ChiTietDonHang_BienThe FOREIGN KEY (MaBienThe)
        REFERENCES BienTheSanPham(MaBienThe)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
ALTER TABLE ChiTietDonHang DROP INDEX UQ_ChiTietDonHang_DonHang_SanPham;

ALTER TABLE ChiTietPhieuNhap ADD COLUMN MaBienThe INT NULL AFTER MaSanPham;
UPDATE ChiTietPhieuNhap ct
INNER JOIN BienTheSanPham bt ON bt.MaSanPham = ct.MaSanPham AND bt.KichThuoc = '' AND bt.MauSac = ''
SET ct.MaBienThe = bt.MaBienThe;
ALTER TABLE ChiTietPhieuNhap MODIFY COLUMN MaBienThe INT NOT NULL;
ALTER TABLE ChiTietPhieuNhap
    ADD CONSTRAINT UQ_ChiTietPhieuNhap_PhieuNhap_BienThe UNIQUE (MaPhieuNhap, MaBienThe),
    ADD CONSTRAINT FK_ChiTietPhieuNhap_BienThe FOREIGN KEY (MaBienThe)
        REFERENCES BienTheSanPham(MaBienThe)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
ALTER TABLE ChiTietPhieuNhap DROP INDEX UQ_ChiTietPhieuNhap_PhieuNhap_SanPham;
