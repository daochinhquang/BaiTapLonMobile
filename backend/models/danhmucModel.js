const db = require('../common/db');
const danhmucModel = {
  getAll: (cb) => db.query('SELECT * FROM `danhmuc`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `danhmuc` WHERE `MaDanhMuc` = ?', [id], cb),
  create: (data, cb) => db.query('INSERT INTO `danhmuc` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `danhmuc` SET ? WHERE `MaDanhMuc` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `danhmuc` WHERE `MaDanhMuc` = ?', [id], cb)
};
module.exports = danhmucModel;
