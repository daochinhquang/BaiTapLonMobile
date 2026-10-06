const db = require('../common/db');
const phieunhapModel = {
  getAll: (cb) => db.query('SELECT * FROM `phieunhap`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `phieunhap` WHERE `MaPhieuNhap` = ?', [id], cb),
  create: (data, cb) => db.query('INSERT INTO `phieunhap` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `phieunhap` SET ? WHERE `MaPhieuNhap` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `phieunhap` WHERE `MaPhieuNhap` = ?', [id], cb)
};
module.exports = phieunhapModel;
