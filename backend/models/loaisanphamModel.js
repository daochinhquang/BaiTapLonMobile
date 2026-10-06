const db = require('../common/db');
const loaisanphamModel = {
  getAll: (cb) => db.query('SELECT * FROM `loaisanpham`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `loaisanpham` WHERE `MaLoaiSanPham` = ?', [id], cb),
  create: (data, cb) => db.query('INSERT INTO `loaisanpham` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `loaisanpham` SET ? WHERE `MaLoaiSanPham` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `loaisanpham` WHERE `MaLoaiSanPham` = ?', [id], cb)
};
module.exports = loaisanphamModel;
