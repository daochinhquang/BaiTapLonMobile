const db = require('../common/db');
const { calculateVoucherDiscount } = require('../common/voucher');

function runSeries(tasks, cb) {
  const [task, ...remainingTasks] = tasks;

  if (!task) {
    return cb(null);
  }

  return task((err) => (err ? cb(err) : runSeries(remainingTasks, cb)));
}

function orderSelectSql(whereSql) {
  return `
    SELECT
      dh.*,
      dc.\`TenNguoiNhan\`,
      dc.\`SoDienThoai\` AS SoDienThoaiNhan,
      dc.\`TinhThanh\`,
      dc.\`QuanHuyen\`,
      dc.\`PhuongXa\`,
      dc.\`DiaChiChiTiet\`
    FROM \`donhang\` dh
    JOIN \`diachi\` dc ON dc.\`MaDiaChi\` = dh.\`MaDiaChi\`
    ${whereSql}
  `;
}

function orderItemsSql() {
  return `
    SELECT
      ctdh.*,
      sp.\`TenSanPham\`,
      sp.\`ThuongHieu\`,
      sp.\`GiaBan\`,
      sp.\`SoLuongTon\`,
      sp.\`MoTa\`,
      sp.\`AnhDaiDien\`,
      sp.\`TrangThai\`,
      lsp.\`MaDanhMuc\`,
      lsp.\`TenLoaiSanPham\`,
      dm.\`TenDanhMuc\`
    FROM \`chitietdonhang\` ctdh
    JOIN \`sanpham\` sp ON sp.\`MaSanPham\` = ctdh.\`MaSanPham\`
    LEFT JOIN \`loaisanpham\` lsp ON lsp.\`MaLoaiSanPham\` = sp.\`MaLoaiSanPham\`
    LEFT JOIN \`danhmuc\` dm ON dm.\`MaDanhMuc\` = lsp.\`MaDanhMuc\`
    WHERE ctdh.\`MaDonHang\` = ?
    ORDER BY ctdh.\`MaChiTietDonHang\` ASC
  `;
}

function withTransaction(work, cb) {
  return db.getConnection((connectionErr, connection) => {
    if (connectionErr) {
      return cb(connectionErr);
    }

    const finish = (err, result) => {
      connection.release();
      return cb(err, result);
    };

    return connection.beginTransaction((transactionErr) => {
      if (transactionErr) {
        return finish(transactionErr);
      }

      const rollback = (err) =>
        connection.rollback(() => finish(err));

      return work(connection, (workErr, result) => {
        if (workErr) {
          return rollback(workErr);
        }

        return connection.commit((commitErr) => (commitErr ? rollback(commitErr) : finish(null, result)));
      });
    });
  });
}

function publicError(status, message) {
  const err = new Error(message);
  err.status = status;

  return err;
}

function loadOrderDetail(orderId, cb) {
  return db.query(
    `${orderSelectSql('WHERE dh.`MaDonHang` = ?')} LIMIT 1`,
    [orderId],
    (orderErr, orderRows) => {
      if (orderErr) {
        return cb(orderErr);
      }

      const order = orderRows && orderRows[0];

      if (!order) {
        return cb(null, null);
      }

      return db.query(orderItemsSql(), [orderId], (itemErr, itemRows) => {
        if (itemErr) {
          return cb(itemErr);
        }

        return cb(null, { ...order, items: itemRows });
      });
    }
  );
}

const donhangModel = {
  getAll: (cb) => db.query(`${orderSelectSql('')} ORDER BY dh.\`MaDonHang\` DESC`, cb),
  getByUserId: (userId, cb) =>
    db.query(
      `${orderSelectSql('WHERE dh.`MaNguoiDung` = ?')} ORDER BY dh.\`MaDonHang\` DESC`,
      [userId],
      cb
    ),
  getById: (id, cb) => loadOrderDetail(id, cb),
  getDetailForUser: (userId, orderId, cb) =>
    loadOrderDetail(orderId, (err, order) => {
      if (err || !order) {
        return cb(err, order);
      }

      if (String(order.MaNguoiDung) !== String(userId)) {
        return cb(null, null);
      }

      return cb(null, order);
    }),
  createCheckout: (payload, cb) =>
    withTransaction((connection, done) => {
      const userId = Number(payload.userId);
      const addressId = Number(payload.addressId);
      const rawVoucherId = payload.voucherId === undefined || payload.voucherId === null ? '' : String(payload.voucherId).trim();
      const voucherId = /^\d+$/.test(rawVoucherId) ? Number(rawVoucherId) : null;
      const voucherCode = payload.voucherCode ? String(payload.voucherCode).trim() : null;
      const paymentMethod = payload.paymentMethod || 'COD';
      const note = payload.note || null;
      const items = payload.items || [];

      return connection.query(
        'SELECT * FROM `diachi` WHERE `MaDiaChi` = ? AND `MaNguoiDung` = ? LIMIT 1',
        [addressId, userId],
        (addressErr, addressRows) => {
          if (addressErr) {
            return done(addressErr);
          }

          if (!addressRows.length) {
            return done(publicError(400, 'Địa chỉ nhận hàng không hợp lệ.'));
          }

          const productIds = items.map((item) => Number(item.MaSanPham));
          const variantIds = items.map((item) => Number(item.MaBienThe));

          return connection.query(
            `SELECT
               bt.*, sp.TenSanPham, sp.TrangThai AS TrangThaiSanPham
             FROM \`bienthesanpham\` bt
             INNER JOIN \`sanpham\` sp ON sp.\`MaSanPham\` = bt.\`MaSanPham\`
             WHERE bt.\`MaBienThe\` IN (?)
             FOR UPDATE`,
            [variantIds],
            (variantErr, variantRows) => {
              if (variantErr) {
                return done(variantErr);
              }

              const variantById = new Map(
                variantRows.map((variant) => [Number(variant.MaBienThe), variant])
              );
              let subtotal = 0;
              const orderLines = [];

              for (const item of items) {
                const productId = Number(item.MaSanPham);
                const variantId = Number(item.MaBienThe);
                const quantity = Math.floor(Number(item.SoLuong));
                const variant = variantById.get(variantId);

                if (
                  !variant || Number(variant.MaSanPham) !== productId ||
                  variant.TrangThai === 'inactive' || variant.TrangThaiSanPham === 'inactive'
                ) {
                  return done(publicError(400, 'Có biến thể sản phẩm không còn bán trong đơn hàng.'));
                }

                if (!Number.isFinite(quantity) || quantity <= 0) {
                  return done(publicError(400, 'Số lượng sản phẩm không hợp lệ.'));
                }

                if (Number(variant.SoLuongTon) < quantity) {
                  return done(publicError(400, `Biến thể của ${variant.TenSanPham} chỉ còn ${variant.SoLuongTon}.`));
                }

                const price = Number(variant.GiaBan);
                subtotal += price * quantity;
                orderLines.push({ price, productId, quantity, variant, variantId });
              }

              const applyVoucher = (next) => {
                if (!voucherId && !voucherCode) {
                  return next(null, { discount: 0, voucher: null });
                }

                return connection.query(
                  `SELECT *
                   FROM \`magiamgia\`
                   WHERE ${voucherId ? '\`MaGiamGia\` = ?' : 'UPPER(\`MaCode\`) = UPPER(?)'}
                     AND \`TrangThai\` = 'active'
                     AND \`NgayBatDau\` <= NOW()
                     AND \`NgayKetThuc\` >= NOW()
                     AND \`SoLuong\` > 0
                   LIMIT 1
                   FOR UPDATE`,
                  [voucherId || voucherCode],
                  (voucherErr, voucherRows) => {
                    if (voucherErr) {
                      return next(voucherErr);
                    }

                    const voucher = voucherRows && voucherRows[0];

                    if (!voucher) {
                      return next(publicError(400, 'Mã giảm giá không hợp lệ hoặc đã hết lượt.'));
                    }

                    if (subtotal < Number(voucher.GiaTriDonHangToiThieu || 0)) {
                      return next(publicError(400, 'Đơn hàng chưa đạt giá trị tối thiểu của mã giảm giá.'));
                    }

                    return connection.query(
                      `SELECT \`DaSuDung\`
                       FROM \`nguoidungmagiamgia\`
                       WHERE \`MaGiamGia\` = ? AND \`MaNguoiDung\` = ?
                       LIMIT 1
                       FOR UPDATE`,
                      [voucher.MaGiamGia, userId],
                      (usageErr, usageRows) => {
                        if (usageErr) {
                          return next(usageErr);
                        }

                        if (usageRows?.[0]?.DaSuDung) {
                          return next(publicError(400, 'Tai khoan nay da su dung ma giam gia.'));
                        }

                        return next(null, {
                          discount: calculateVoucherDiscount(voucher, subtotal),
                          voucher,
                        });
                      }
                    );
                  }
                );
              };

              return applyVoucher((voucherErr, appliedVoucher) => {
                if (voucherErr) {
                  return done(voucherErr);
                }

                const discount = appliedVoucher?.discount || 0;
                const appliedVoucherId = appliedVoucher?.voucher
                  ? Number(appliedVoucher.voucher.MaGiamGia)
                  : null;
                const shippingFee = subtotal >= 1500000 ? 0 : 30000;
                const total = Math.max(0, subtotal + shippingFee - discount);
                const paymentStatus = 'unpaid';

                return connection.query(
                  `INSERT INTO \`donhang\`
                   SET \`MaNguoiDung\` = ?,
                       \`MaDiaChi\` = ?,
                       \`MaGiamGia\` = ?,
                       \`TongTienHang\` = ?,
                       \`SoTienGiam\` = ?,
                       \`PhiVanChuyen\` = ?,
                       \`TongThanhToan\` = ?,
                       \`PhuongThucThanhToan\` = ?,
                       \`TrangThaiThanhToan\` = ?,
                       \`TrangThaiDonHang\` = 'pending',
                       \`GhiChu\` = ?`,
                  [
                    userId,
                    addressId,
                    appliedVoucherId,
                    subtotal,
                    discount,
                    shippingFee,
                    total,
                    paymentMethod,
                    paymentStatus,
                    note,
                  ],
                  (orderErr, orderResult) => {
                    if (orderErr) {
                      return done(orderErr);
                    }

                    const orderId = orderResult.insertId;
                    const tasks = [];

                    for (const line of orderLines) {
                      tasks.push((next) =>
                        connection.query(
                          `INSERT INTO \`chitietdonhang\`
                           (\`MaDonHang\`, \`MaSanPham\`, \`MaBienThe\`, \`SoLuong\`, \`DonGia\`, \`KichThuoc\`, \`MauSac\`)
                           VALUES (?, ?, ?, ?, ?, ?, ?)`,
                          [
                            orderId,
                            line.productId,
                            line.variantId,
                            line.quantity,
                            line.price,
                            line.variant.KichThuoc,
                            line.variant.MauSac,
                          ],
                          next
                        )
                      );
                      tasks.push((next) =>
                        connection.query(
                          `UPDATE \`bienthesanpham\`
                           SET \`SoLuongTon\` = \`SoLuongTon\` - ?,
                               \`TrangThai\` = IF(\`SoLuongTon\` = 0, 'out_of_stock', \`TrangThai\`)
                           WHERE \`MaBienThe\` = ?`,
                          [line.quantity, line.variantId],
                          next
                        )
                      );
                      tasks.push((next) =>
                        connection.query(
                          `UPDATE \`sanpham\`
                           SET \`SoLuongTon\` = \`SoLuongTon\` - ?,
                               \`TrangThai\` = IF(\`SoLuongTon\` = 0, 'out_of_stock', \`TrangThai\`)
                           WHERE \`MaSanPham\` = ?`,
                          [line.quantity, line.productId],
                          next
                        )
                      );
                    }

                    if (payload.clearCart) {
                      tasks.push((next) => connection.query(
                        'DELETE ct FROM `chitietgiohang` ct JOIN `giohang` gh ON gh.`MaGioHang` = ct.`MaGioHang` WHERE gh.`MaNguoiDung` = ? AND ct.`MaBienThe` IN (?)',
                        [userId, variantIds], next
                      ));
                    }

                    if (appliedVoucherId) {
                      tasks.push((next) =>
                        connection.query(
                          'UPDATE `magiamgia` SET `SoLuong` = `SoLuong` - 1 WHERE `MaGiamGia` = ?',
                          [appliedVoucherId],
                          next
                        )
                      );
                      tasks.push((next) =>
                        connection.query(
                          `INSERT INTO \`nguoidungmagiamgia\`
                           (\`MaGiamGia\`, \`MaNguoiDung\`, \`DaSuDung\`, \`NgaySuDung\`)
                           VALUES (?, ?, TRUE, NOW())
                           ON DUPLICATE KEY UPDATE
                             \`DaSuDung\` = VALUES(\`DaSuDung\`),
                             \`NgaySuDung\` = VALUES(\`NgaySuDung\`)`,
                          [appliedVoucherId, userId],
                          next
                        )
                      );
                    }

                    tasks.push((next) =>
                      connection.query(
                        `INSERT INTO \`thanhtoan\`
                         SET \`MaDonHang\` = ?,
                             \`PhuongThucThanhToan\` = ?,
                             \`SoTien\` = ?,
                             \`TrangThaiThanhToan\` = ?,
                             \`NgayThanhToan\` = ?`,
                        [orderId, paymentMethod, total, paymentStatus, paymentStatus === 'paid' ? new Date() : null],
                        next
                      )
                    );

                    return runSeries(tasks, (taskErr) => (taskErr ? done(taskErr) : done(null, { orderId })));
                  }
                );
              });
            }
          );
        }
      );
    }, (err, result) => {
      if (err) {
        return cb(err);
      }

      return loadOrderDetail(result.orderId, cb);
    }),
  cancelForUser: (userId, orderId, cb) =>
    withTransaction((connection, done) =>
      connection.query(
        'SELECT * FROM `donhang` WHERE `MaDonHang` = ? AND `MaNguoiDung` = ? LIMIT 1 FOR UPDATE',
        [orderId, userId],
        (orderErr, orderRows) => {
          if (orderErr) {
            return done(orderErr);
          }

          const order = orderRows && orderRows[0];

          if (!order) {
            return done(publicError(404, 'Không tìm thấy đơn hàng.'));
          }

          if (!['pending', 'confirmed'].includes(order.TrangThaiDonHang)) {
            return done(publicError(400, 'Chỉ có thể hủy đơn khi đơn còn chờ xác nhận hoặc đã xác nhận.'));
          }

          return connection.query(
            'SELECT * FROM `chitietdonhang` WHERE `MaDonHang` = ?',
            [orderId],
            (itemErr, itemRows) => {
              if (itemErr) {
                return done(itemErr);
              }

              const tasks = [];
              for (const item of itemRows) {
                tasks.push((next) => connection.query(
                  `UPDATE \`bienthesanpham\`
                   SET \`SoLuongTon\` = \`SoLuongTon\` + ?,
                       \`TrangThai\` = IF(\`TrangThai\` = 'out_of_stock', 'active', \`TrangThai\`)
                   WHERE \`MaBienThe\` = ?`,
                  [item.SoLuong, item.MaBienThe],
                  next
                ));
                tasks.push((next) => connection.query(
                  `UPDATE \`sanpham\`
                   SET \`SoLuongTon\` = \`SoLuongTon\` + ?,
                       \`TrangThai\` = IF(\`TrangThai\` = 'out_of_stock', 'active', \`TrangThai\`)
                   WHERE \`MaSanPham\` = ?`,
                  [item.SoLuong, item.MaSanPham],
                  next
                ));
              }

              tasks.push((next) =>
                connection.query(
                  `UPDATE \`donhang\`
                   SET \`TrangThaiDonHang\` = 'cancelled',
                       \`TrangThaiThanhToan\` = IF(\`TrangThaiThanhToan\` = 'paid', 'refunded', \`TrangThaiThanhToan\`)
                   WHERE \`MaDonHang\` = ?`,
                  [orderId],
                  next
                )
              );
              tasks.push((next) =>
                connection.query(
                  `UPDATE \`thanhtoan\`
                   SET \`TrangThaiThanhToan\` = IF(\`TrangThaiThanhToan\` = 'paid', 'refunded', \`TrangThaiThanhToan\`)
                   WHERE \`MaDonHang\` = ?`,
                  [orderId],
                  next
                )
              );
              if (order.MaGiamGia) {
                tasks.push((next) =>
                  connection.query(
                    'UPDATE `magiamgia` SET `SoLuong` = `SoLuong` + 1 WHERE `MaGiamGia` = ?',
                    [order.MaGiamGia],
                    next
                  )
                );
                tasks.push((next) =>
                  connection.query(
                    `UPDATE \`nguoidungmagiamgia\`
                     SET \`DaSuDung\` = FALSE,
                         \`NgaySuDung\` = NULL
                     WHERE \`MaGiamGia\` = ? AND \`MaNguoiDung\` = ?`,
                    [order.MaGiamGia, userId],
                    next
                  )
                );
              }

              return runSeries(tasks, (taskErr) => (taskErr ? done(taskErr) : done(null, { orderId })));
            }
          );
        }
      ),
    (err, result) => {
      if (err) {
        return cb(err);
      }

      return loadOrderDetail(result.orderId, cb);
    }),
  create: (data, cb) => db.query('INSERT INTO `donhang` SET ?', data, cb),
  update: (id, data, cb) => db.query('UPDATE `donhang` SET ? WHERE `MaDonHang` = ?', [data, id], cb),
  delete: (id, cb) => db.query('DELETE FROM `donhang` WHERE `MaDonHang` = ?', [id], cb)
};
module.exports = donhangModel;
