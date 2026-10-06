const db = require('../common/db');

function cartItemsSql() {
  return `
    SELECT
      gh.\`MaGioHang\`,
      ct.\`MaChiTietGioHang\`,
      ct.\`MaSanPham\`,
      ct.\`MaBienThe\`,
      ct.\`SoLuong\`,
      sp.\`TenSanPham\`,
      sp.\`ThuongHieu\`,
      sp.\`GiaBan\`,
      sp.\`SoLuongTon\`,
      sp.\`MoTa\`,
      sp.\`AnhDaiDien\`,
      sp.\`TrangThai\`,
      bt.\`KichThuoc\`,
      bt.\`MauSac\`,
      bt.\`GiaBan\` AS \`GiaBienThe\`,
      bt.\`SoLuongTon\` AS \`SoLuongTonBienThe\`,
      bt.\`TrangThai\` AS \`TrangThaiBienThe\`,
      lsp.\`MaDanhMuc\`,
      lsp.\`TenLoaiSanPham\`,
      dm.\`TenDanhMuc\`
    FROM \`giohang\` gh
    JOIN \`chitietgiohang\` ct ON ct.\`MaGioHang\` = gh.\`MaGioHang\`
    JOIN \`sanpham\` sp ON sp.\`MaSanPham\` = ct.\`MaSanPham\`
    JOIN \`bienthesanpham\` bt ON bt.\`MaBienThe\` = ct.\`MaBienThe\`
    LEFT JOIN \`loaisanpham\` lsp ON lsp.\`MaLoaiSanPham\` = sp.\`MaLoaiSanPham\`
    LEFT JOIN \`danhmuc\` dm ON dm.\`MaDanhMuc\` = lsp.\`MaDanhMuc\`
    WHERE gh.\`MaNguoiDung\` = ?
    ORDER BY ct.\`MaChiTietGioHang\` DESC
  `;
}

const giohangModel = {
  getAll: (cb) => db.query('SELECT * FROM `giohang`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `giohang` WHERE `MaGioHang` = ?', [id], cb),
  getByUserId: (userId, cb) => db.query('SELECT * FROM `giohang` WHERE `MaNguoiDung` = ? LIMIT 1', [userId], cb),
  getItemsByUserId: (userId, cb) => db.query(cartItemsSql(), [userId], cb),
  getVariant: (productId, variantId, cb) => {
    const params = [productId];
    const variantFilter = variantId ? 'AND bt.`MaBienThe` = ?' : '';
    if (variantId) params.push(variantId);
    return db.query(
      `SELECT bt.*, sp.TenSanPham, sp.TrangThai AS TrangThaiSanPham
       FROM bienthesanpham bt
       INNER JOIN sanpham sp ON sp.MaSanPham = bt.MaSanPham
       WHERE bt.MaSanPham = ? ${variantFilter}
         AND bt.TrangThai <> 'inactive'
       ORDER BY bt.MaBienThe
       LIMIT 1`,
      params,
      cb
    );
  },
  getItem: (cartId, variantId, cb) => db.query(
    'SELECT * FROM `chitietgiohang` WHERE `MaGioHang` = ? AND `MaBienThe` = ? LIMIT 1',
    [cartId, variantId],
    cb
  ),
  getOrCreateByUserId: (userId, cb) =>
    db.query('INSERT IGNORE INTO `giohang` (`MaNguoiDung`) VALUES (?)', [userId], (insertErr) => {
      if (insertErr) {
        return cb(insertErr);
      }

      return db.query('SELECT * FROM `giohang` WHERE `MaNguoiDung` = ? LIMIT 1', [userId], cb);
    }),
  addItem: (cartId, productId, variantId, quantity, cb) =>
    db.query(
      `INSERT INTO \`chitietgiohang\` (\`MaGioHang\`, \`MaSanPham\`, \`MaBienThe\`, \`SoLuong\`)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE \`SoLuong\` = \`SoLuong\` + VALUES(\`SoLuong\`)`,
      [cartId, productId, variantId, quantity],
      cb
    ),
  updateItemQuantity: (cartId, variantId, quantity, cb) =>
    db.query(
      'UPDATE `chitietgiohang` SET `SoLuong` = ? WHERE `MaGioHang` = ? AND `MaBienThe` = ?',
      [quantity, cartId, variantId],
      cb
    ),
  deleteItem: (cartId, variantId, cb) =>
    db.query(
      'DELETE FROM `chitietgiohang` WHERE `MaGioHang` = ? AND `MaBienThe` = ?',
      [cartId, variantId],
      cb
    ),
  create: (data, cb) => db.query('INSERT INTO `giohang` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `giohang` SET ? WHERE `MaGioHang` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `giohang` WHERE `MaGioHang` = ?', [id], cb)
};
module.exports = giohangModel;
