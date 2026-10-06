const db = require('../common/db');
const { calculateVoucherDiscount } = require('../common/voucher');

const magiamgiaModel = {
  getAll: (cb) => db.query('SELECT * FROM `magiamgia` ORDER BY `NgayTao` DESC, `MaGiamGia` DESC', cb),
  getAvailable: (userId, cb) =>
    db.query(
      `SELECT *
       FROM \`magiamgia\`
       WHERE \`TrangThai\` = 'active'
         AND \`NgayBatDau\` <= NOW()
         AND \`NgayKetThuc\` >= NOW()
         AND \`SoLuong\` > 0
         AND NOT EXISTS (
           SELECT 1 FROM \`nguoidungmagiamgia\` ndmgg
           WHERE ndmgg.\`MaGiamGia\` = \`magiamgia\`.\`MaGiamGia\`
             AND ndmgg.\`MaNguoiDung\` = ? AND ndmgg.\`DaSuDung\` = TRUE
         )
       ORDER BY \`GiaTriDonHangToiThieu\`, \`NgayKetThuc\``,
      [userId], cb
    ),
  getById: (id, cb) => db.query('SELECT * FROM `magiamgia` WHERE `MaGiamGia` = ?', [id], cb),
  validate: ({ code, subtotal, userId }, cb) =>
    db.query(
      `SELECT *
       FROM \`magiamgia\`
       WHERE UPPER(\`MaCode\`) = UPPER(?)
         AND \`TrangThai\` = 'active'
         AND \`NgayBatDau\` <= NOW()
         AND \`NgayKetThuc\` >= NOW()
         AND \`SoLuong\` > 0
       LIMIT 1`,
      [code],
      (err, rows) => {
        if (err) return cb(err);

        const voucher = rows && rows[0];
        if (!voucher) {
          const error = new Error('Ma giam gia khong hop le hoac da het hieu luc.');
          error.status = 404;
          return cb(error);
        }

        if (subtotal < Number(voucher.GiaTriDonHangToiThieu || 0)) {
          const error = new Error('Don hang chua dat gia tri toi thieu cua ma giam gia.');
          error.status = 400;
          return cb(error);
        }

        const respond = () =>
          cb(null, {
            ...voucher,
            SoTienGiam: calculateVoucherDiscount(voucher, subtotal),
          });

        if (!userId) {
          return respond();
        }

        return db.query(
          `SELECT \`DaSuDung\`
           FROM \`nguoidungmagiamgia\`
           WHERE \`MaGiamGia\` = ? AND \`MaNguoiDung\` = ?
           LIMIT 1`,
          [voucher.MaGiamGia, userId],
          (usageErr, usageRows) => {
            if (usageErr) return cb(usageErr);
            if (usageRows?.[0]?.DaSuDung) {
              const error = new Error('Tai khoan nay da su dung ma giam gia.');
              error.status = 400;
              return cb(error);
            }

            return respond();
          }
        );
      }
    ),
  create: (data, cb) => db.query('INSERT INTO `magiamgia` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `magiamgia` SET ? WHERE `MaGiamGia` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `magiamgia` WHERE `MaGiamGia` = ?', [id], cb)
};
module.exports = magiamgiaModel;
