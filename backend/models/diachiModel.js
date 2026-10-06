const db = require('../common/db');
const diachiModel = {
  getAll: (cb) => db.query('SELECT * FROM `diachi`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `diachi` WHERE `MaDiaChi` = ?', [id], cb),
  getByUserId: (userId, cb) =>
    db.query(
      'SELECT * FROM `diachi` WHERE `MaNguoiDung` = ? ORDER BY `MacDinh` DESC, `MaDiaChi` DESC',
      [userId],
      cb
    ),
  clearDefaultByUserId: (userId, cb) =>
    db.query('UPDATE `diachi` SET `MacDinh` = 0 WHERE `MaNguoiDung` = ?', [userId], cb),
  create: (data, cb) => db.query('INSERT INTO `diachi` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `diachi` SET ? WHERE `MaDiaChi` = ?', [data, id], cb),
  updateByUserId: (id, userId, data, cb) =>
    db.query('UPDATE `diachi` SET ? WHERE `MaDiaChi` = ? AND `MaNguoiDung` = ?', [data, id, userId], cb),
  delete: (id, cb) => db.query('DELETE FROM `diachi` WHERE `MaDiaChi` = ?', [id], cb),
  deleteByUserId: (id, userId, cb) =>
    db.query('DELETE FROM `diachi` WHERE `MaDiaChi` = ? AND `MaNguoiDung` = ?', [id, userId], cb),
  setLatestDefaultByUserId: (userId, cb) =>
    db.query(
      `UPDATE \`diachi\`
       SET \`MacDinh\` = 1
       WHERE \`MaDiaChi\` = (
         SELECT \`MaDiaChi\`
         FROM (
           SELECT \`MaDiaChi\`
           FROM \`diachi\`
           WHERE \`MaNguoiDung\` = ?
           ORDER BY \`MaDiaChi\` DESC
           LIMIT 1
         ) latest_address
       )`,
      [userId],
      cb
    )
};
module.exports = diachiModel;
