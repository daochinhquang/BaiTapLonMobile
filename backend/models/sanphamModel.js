const db = require('../common/db');

function buildProductWhere(filters = {}) {
  const where = ['sp.`TrangThai` <> ?'];
  const params = ['inactive'];

  if (filters.keyword) {
    where.push(
      '(sp.`TenSanPham` LIKE ? OR sp.`ThuongHieu` LIKE ? OR sp.`MoTa` LIKE ? OR lsp.`TenLoaiSanPham` LIKE ? OR dm.`TenDanhMuc` LIKE ?)'
    );
    const keyword = `%${filters.keyword}%`;
    params.push(keyword, keyword, keyword, keyword, keyword);
  }

  if (filters.categoryId && filters.categoryId !== 'all') {
    where.push('dm.`MaDanhMuc` = ?');
    params.push(Number(filters.categoryId));
  }

  if (filters.typeId) {
    where.push('lsp.`MaLoaiSanPham` = ?');
    params.push(Number(filters.typeId));
  }

  if (filters.minPrice !== undefined && filters.minPrice !== '') {
    where.push('sp.`GiaBan` >= ?');
    params.push(Number(filters.minPrice));
  }

  if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
    where.push('sp.`GiaBan` <= ?');
    params.push(Number(filters.maxPrice));
  }

  return { params, whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '' };
}

function productSelectSql() {
  return `
    SELECT
      sp.*,
      lsp.\`TenLoaiSanPham\`,
      lsp.\`MaDanhMuc\`,
      dm.\`TenDanhMuc\`,
      ncc.\`TenNhaCungCap\`,
      GROUP_CONCAT(hsp.\`DuongDanHinhAnh\` ORDER BY hsp.\`LaAnhChinh\` DESC, hsp.\`MaHinhAnh\` ASC SEPARATOR '||') AS HinhAnhKhac
    FROM \`sanpham\` sp
    LEFT JOIN \`loaisanpham\` lsp ON lsp.\`MaLoaiSanPham\` = sp.\`MaLoaiSanPham\`
    LEFT JOIN \`danhmuc\` dm ON dm.\`MaDanhMuc\` = lsp.\`MaDanhMuc\`
    LEFT JOIN \`nhacungcap\` ncc ON ncc.\`MaNhaCungCap\` = sp.\`MaNhaCungCap\`
    LEFT JOIN \`hinhanhsanpham\` hsp ON hsp.\`MaSanPham\` = sp.\`MaSanPham\`
  `;
}

function productGroupSql() {
  return `
    GROUP BY
      sp.\`MaSanPham\`,
      sp.\`MaLoaiSanPham\`,
      sp.\`MaNhaCungCap\`,
      sp.\`TenSanPham\`,
      sp.\`ThuongHieu\`,
      sp.\`GiaBan\`,
      sp.\`SoLuongTon\`,
      sp.\`MoTa\`,
      sp.\`AnhDaiDien\`,
      sp.\`TrangThai\`,
      sp.\`NgayTao\`,
      sp.\`NgayCapNhat\`,
      lsp.\`TenLoaiSanPham\`,
      lsp.\`MaDanhMuc\`,
      dm.\`TenDanhMuc\`,
      ncc.\`TenNhaCungCap\`
  `;
}

function sortSql(sort) {
  switch (sort) {
    case 'price_asc':
      return 'ORDER BY sp.`GiaBan` ASC, sp.`MaSanPham` DESC';
    case 'price_desc':
      return 'ORDER BY sp.`GiaBan` DESC, sp.`MaSanPham` DESC';
    case 'name_asc':
      return 'ORDER BY sp.`TenSanPham` ASC';
    case 'newest':
    default:
      return 'ORDER BY sp.`MaSanPham` DESC';
  }
}

function attachVariants(products, cb) {
  if (!products.length) {
    return cb(null, products);
  }

  const productIds = products.map((product) => product.MaSanPham);
  return db.query(
    `SELECT
       MaBienThe, MaSanPham, KichThuoc, MauSac, GiaBan, SoLuongTon, TrangThai
     FROM bienthesanpham
     WHERE MaSanPham IN (?)
     ORDER BY MaSanPham, MaBienThe`,
    [productIds],
    (variantErr, variants) => {
      if (variantErr) return cb(variantErr);
      const byProduct = new Map();
      for (const variant of variants) {
        const list = byProduct.get(Number(variant.MaSanPham)) || [];
        list.push(variant);
        byProduct.set(Number(variant.MaSanPham), list);
      }
      return cb(null, products.map((product) => ({
        ...product,
        BienThe: byProduct.get(Number(product.MaSanPham)) || [],
      })));
    }
  );
}

const sanphamModel = {
  getAll: (cb) => db.query('SELECT * FROM `sanpham`', cb),
  search: (filters, cb) => {
    const { params, whereSql } = buildProductWhere(filters);
    const sql = `
      ${productSelectSql()}
      ${whereSql}
      ${productGroupSql()}
      ${sortSql(filters.sort)}
    `;

    return db.query(sql, params, (err, products) => (
      err ? cb(err) : attachVariants(products, cb)
    ));
  },
  getById: (id, cb) =>
    db.query(
      `
      ${productSelectSql()}
      WHERE sp.\`MaSanPham\` = ?
      ${productGroupSql()}
      LIMIT 1
      `,
      [id],
      (err, products) => (err ? cb(err) : attachVariants(products, cb))
    ),
  create: (data, cb) => db.query('INSERT INTO `sanpham` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `sanpham` SET ? WHERE `MaSanPham` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `sanpham` WHERE `MaSanPham` = ?', [id], cb)
};
module.exports = sanphamModel;
