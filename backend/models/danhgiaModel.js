const db = require('../common/db');
const danhgiaModel = {
  getAll: (cb) => db.query('SELECT * FROM `danhgia`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `danhgia` WHERE `MaDanhGia` = ?', [id], cb),
  create: (data, cb) => db.query('INSERT INTO `danhgia` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `danhgia` SET ? WHERE `MaDanhGia` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `danhgia` WHERE `MaDanhGia` = ?', [id], cb)
};
module.exports = danhgiaModel;
