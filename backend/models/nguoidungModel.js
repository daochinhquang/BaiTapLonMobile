const db = require('../common/db');

let profileColumnsReady = false;

function runSequentialQueries(queries, cb) {
  const [nextQuery, ...remainingQueries] = queries;

  if (!nextQuery) {
    return cb(null);
  }

  return db.query(nextQuery, (err) => {
    if (err) {
      return cb(err);
    }

    return runSequentialQueries(remainingQueries, cb);
  });
}

const nguoidungModel = {
  getAll: (cb) => db.query('SELECT * FROM `nguoidung`', cb),
  getById: (id, cb) => db.query('SELECT * FROM `nguoidung` WHERE `MaNguoiDung` = ?', [id], cb),
  findByIdentifier: (identifier, cb) =>
    db.query(
      'SELECT * FROM `nguoidung` WHERE `Email` = ? OR `SoDienThoai` = ? LIMIT 1',
      [identifier, identifier],
      cb
    ),
  findByEmailOrPhone: (email, phone, cb) =>
    db.query(
      'SELECT * FROM `nguoidung` WHERE (`Email` = ? AND ? IS NOT NULL) OR (`SoDienThoai` = ? AND ? IS NOT NULL) LIMIT 1',
      [email, email, phone, phone],
      cb
    ),
  create: (data, cb) => db.query('INSERT INTO `nguoidung` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `nguoidung` SET ? WHERE `MaNguoiDung` = ?', [data, id], cb),
  updateProfile: (id, data, cb) =>
    db.query('UPDATE `nguoidung` SET ? WHERE `MaNguoiDung` = ? AND `VaiTro` = ?', [data, id, 'user'], cb),
  updatePassword: (id, password, cb) =>
    db.query('UPDATE `nguoidung` SET `MatKhau` = ? WHERE `MaNguoiDung` = ? AND `VaiTro` = ?', [password, id, 'user'], cb),
  ensureProfileColumns: (cb) => {
    if (profileColumnsReady) {
      return cb(null);
    }

    return db.query(
      `SELECT COLUMN_NAME, DATA_TYPE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND LOWER(TABLE_NAME) = 'nguoidung'`,
      (err, rows) => {
        if (err) {
          return cb(err);
        }

        const columns = new Map(rows.map((row) => [row.COLUMN_NAME, row.DATA_TYPE]));
        const queries = [];

        if (columns.get('AnhDaiDien') !== 'longtext') {
          queries.push('ALTER TABLE `nguoidung` MODIFY COLUMN `AnhDaiDien` LONGTEXT NULL');
        }

        if (!columns.has('GioiTinh')) {
          queries.push('ALTER TABLE `nguoidung` ADD COLUMN `GioiTinh` VARCHAR(20) NULL AFTER `AnhDaiDien`');
        }

        if (!columns.has('NgaySinh')) {
          queries.push('ALTER TABLE `nguoidung` ADD COLUMN `NgaySinh` VARCHAR(20) NULL AFTER `GioiTinh`');
        }

        return runSequentialQueries(queries, (queryErr) => {
          if (!queryErr) {
            profileColumnsReady = true;
          }

          return cb(queryErr);
        });
      }
    );
  },
  delete: (id, cb) => db.query('DELETE FROM `nguoidung` WHERE `MaNguoiDung` = ?', [id], cb)
};
module.exports = nguoidungModel;
