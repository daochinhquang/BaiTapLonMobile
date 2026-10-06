const db = require('./db').promise();

let productImageColumnReady = false;
let productVariantSchemaReady = false;

async function ensureProductImageColumn() {
  if (productImageColumnReady) {
    return;
  }

  const [columns] = await db.query(`
    SELECT DATA_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = 'sanpham'
      AND COLUMN_NAME = 'AnhDaiDien'
    LIMIT 1
  `);

  if (!columns.length) {
    await db.query('ALTER TABLE sanpham ADD COLUMN AnhDaiDien LONGTEXT NULL AFTER MoTa');
  } else if (String(columns[0].DATA_TYPE).toLowerCase() !== 'longtext') {
    await db.query('ALTER TABLE sanpham MODIFY COLUMN AnhDaiDien LONGTEXT NULL');
  }

  productImageColumnReady = true;
}

async function hasColumn(tableName, columnName) {
  const [columns] = await db.query(`
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = LOWER(?)
      AND LOWER(COLUMN_NAME) = LOWER(?)
    LIMIT 1
  `, [tableName, columnName]);
  return columns.length > 0;
}

async function hasIndex(tableName, indexName) {
  const [indexes] = await db.query(`
    SELECT 1
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = LOWER(?)
      AND LOWER(INDEX_NAME) = LOWER(?)
    LIMIT 1
  `, [tableName, indexName]);
  return indexes.length > 0;
}

async function hasConstraint(tableName, constraintName) {
  const [constraints] = await db.query(`
    SELECT 1
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = LOWER(?)
      AND LOWER(CONSTRAINT_NAME) = LOWER(?)
    LIMIT 1
  `, [tableName, constraintName]);
  return constraints.length > 0;
}

async function ensureVariantReference({
  foreignKey,
  oldUnique,
  table,
  unique,
  uniqueColumns,
}) {
  if (!await hasColumn(table, 'MaBienThe')) {
    await db.query(`ALTER TABLE ${table} ADD COLUMN MaBienThe INT NULL AFTER MaSanPham`);
  }

  await db.query(`
    UPDATE ${table} ct
    INNER JOIN bienthesanpham bt
      ON bt.MaSanPham = ct.MaSanPham AND bt.KichThuoc = '' AND bt.MauSac = ''
    SET ct.MaBienThe = bt.MaBienThe
    WHERE ct.MaBienThe IS NULL
  `);

  await db.query(`ALTER TABLE ${table} MODIFY COLUMN MaBienThe INT NOT NULL`);
  if (!await hasIndex(table, unique)) {
    await db.query(`ALTER TABLE ${table} ADD CONSTRAINT ${unique} UNIQUE (${uniqueColumns})`);
  }
  if (await hasIndex(table, oldUnique)) {
    await db.query(`ALTER TABLE ${table} DROP INDEX ${oldUnique}`);
  }
  if (!await hasConstraint(table, foreignKey)) {
    await db.query(`
      ALTER TABLE ${table}
      ADD CONSTRAINT ${foreignKey} FOREIGN KEY (MaBienThe)
        REFERENCES bienthesanpham(MaBienThe)
        ON DELETE ${table === 'chitietgiohang' ? 'CASCADE' : 'RESTRICT'}
        ON UPDATE CASCADE
    `);
  }
}

async function ensureProductVariantSchema() {
  if (productVariantSchemaReady) return;

  await db.query(`
    CREATE TABLE IF NOT EXISTS bienthesanpham (
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
        REFERENCES sanpham(MaSanPham)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB
  `);
  await db.query(`
    INSERT INTO bienthesanpham (MaSanPham, KichThuoc, MauSac, GiaBan, SoLuongTon, TrangThai)
    SELECT sp.MaSanPham, '', '', sp.GiaBan, sp.SoLuongTon, sp.TrangThai
    FROM sanpham sp
    WHERE NOT EXISTS (
      SELECT 1 FROM bienthesanpham bt WHERE bt.MaSanPham = sp.MaSanPham
    )
  `);

  if (!await hasColumn('chitietdonhang', 'KichThuoc')) {
    await db.query("ALTER TABLE chitietdonhang ADD COLUMN KichThuoc VARCHAR(50) NOT NULL DEFAULT '' AFTER DonGia");
  }
  if (!await hasColumn('chitietdonhang', 'MauSac')) {
    await db.query("ALTER TABLE chitietdonhang ADD COLUMN MauSac VARCHAR(80) NOT NULL DEFAULT '' AFTER KichThuoc");
  }

  await ensureVariantReference({
    foreignKey: 'FK_ChiTietGioHang_BienThe',
    oldUnique: 'UQ_ChiTietGioHang_GioHang_SanPham',
    table: 'chitietgiohang',
    unique: 'UQ_ChiTietGioHang_GioHang_BienThe',
    uniqueColumns: 'MaGioHang, MaBienThe',
  });
  await ensureVariantReference({
    foreignKey: 'FK_ChiTietDonHang_BienThe',
    oldUnique: 'UQ_ChiTietDonHang_DonHang_SanPham',
    table: 'chitietdonhang',
    unique: 'UQ_ChiTietDonHang_DonHang_BienThe',
    uniqueColumns: 'MaDonHang, MaBienThe',
  });
  await ensureVariantReference({
    foreignKey: 'FK_ChiTietPhieuNhap_BienThe',
    oldUnique: 'UQ_ChiTietPhieuNhap_PhieuNhap_SanPham',
    table: 'chitietphieunhap',
    unique: 'UQ_ChiTietPhieuNhap_PhieuNhap_BienThe',
    uniqueColumns: 'MaPhieuNhap, MaBienThe',
  });

  productVariantSchemaReady = true;
}

module.exports = { ensureProductImageColumn, ensureProductVariantSchema };
