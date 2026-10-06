const db = require('../common/db');
const chitietgiohangModel = {
  getAll: (cb) => db.query('SELECT * FROM `chitietgiohang`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `chitietgiohang` WHERE `MaChiTietGioHang` = ?', [id], cb),
  create: (data, cb) => db.query('INSERT INTO `chitietgiohang` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `chitietgiohang` SET ? WHERE `MaChiTietGioHang` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `chitietgiohang` WHERE `MaChiTietGioHang` = ?', [id], cb)
};
module.exports = chitietgiohangModel;
