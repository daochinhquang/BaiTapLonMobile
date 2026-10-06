const db = require('../common/db');
const hinhanhsanphamModel = {
  getAll: (cb) => db.query('SELECT * FROM `hinhanhsanpham`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `hinhanhsanpham` WHERE `MaHinhAnh` = ?', [id], cb),
  create: (data, cb) => db.query('INSERT INTO `hinhanhsanpham` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `hinhanhsanpham` SET ? WHERE `MaHinhAnh` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `hinhanhsanpham` WHERE `MaHinhAnh` = ?', [id], cb)
};
module.exports = hinhanhsanphamModel;
