const db = require('../common/db');
const thanhtoanModel = {
  getAll: (cb) => db.query('SELECT * FROM `thanhtoan`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `thanhtoan` WHERE `MaThanhToan` = ?', [id], cb),
  create: (data, cb) => db.query('INSERT INTO `thanhtoan` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `thanhtoan` SET ? WHERE `MaThanhToan` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `thanhtoan` WHERE `MaThanhToan` = ?', [id], cb)
};
module.exports = thanhtoanModel;
