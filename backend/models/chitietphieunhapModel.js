const db = require('../common/db');
const chitietphieunhapModel = {
  getAll: (cb) => db.query('SELECT * FROM `chitietphieunhap`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `chitietphieunhap` WHERE `MaChiTietPhieuNhap` = ?', [id], cb),
  create: (data, cb) => db.query('INSERT INTO `chitietphieunhap` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `chitietphieunhap` SET ? WHERE `MaChiTietPhieuNhap` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `chitietphieunhap` WHERE `MaChiTietPhieuNhap` = ?', [id], cb)
};
module.exports = chitietphieunhapModel;
