const db = require('../common/db');
const chitietdonhangModel = {
  getAll: (cb) => db.query('SELECT * FROM `chitietdonhang`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `chitietdonhang` WHERE `MaChiTietDonHang` = ?', [id], cb),
  create: (data, cb) => db.query('INSERT INTO `chitietdonhang` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `chitietdonhang` SET ? WHERE `MaChiTietDonHang` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `chitietdonhang` WHERE `MaChiTietDonHang` = ?', [id], cb)
};
module.exports = chitietdonhangModel;
