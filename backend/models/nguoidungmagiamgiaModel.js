const db = require('../common/db');
const nguoidungmagiamgiaModel = {
  getAll: (cb) => db.query('SELECT * FROM `nguoidungmagiamgia`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `nguoidungmagiamgia` WHERE `MaNguoiDungMaGiamGia` = ?', [id], cb),
  create: (data, cb) => db.query('INSERT INTO `nguoidungmagiamgia` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `nguoidungmagiamgia` SET ? WHERE `MaNguoiDungMaGiamGia` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `nguoidungmagiamgia` WHERE `MaNguoiDungMaGiamGia` = ?', [id], cb)
};
module.exports = nguoidungmagiamgiaModel;
