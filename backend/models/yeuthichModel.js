const db = require('../common/db');
const yeuthichModel = {
  getAll: (cb) => db.query('SELECT * FROM `yeuthich`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `yeuthich` WHERE `MaYeuThich` = ?', [id], cb),
  create: (data, cb) => db.query('INSERT INTO `yeuthich` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `yeuthich` SET ? WHERE `MaYeuThich` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `yeuthich` WHERE `MaYeuThich` = ?', [id], cb)
};
module.exports = yeuthichModel;
