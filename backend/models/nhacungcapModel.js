const db = require('../common/db');
const nhacungcapModel = {
  getAll: (cb) => db.query('SELECT * FROM `nhacungcap`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `nhacungcap` WHERE `MaNhaCungCap` = ?', [id], cb),
  create: (data, cb) => db.query('INSERT INTO `nhacungcap` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `nhacungcap` SET ? WHERE `MaNhaCungCap` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `nhacungcap` WHERE `MaNhaCungCap` = ?', [id], cb)
};
module.exports = nhacungcapModel;
