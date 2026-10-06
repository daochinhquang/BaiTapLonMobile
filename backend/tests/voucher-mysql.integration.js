const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const pool = require('../common/db');
const { normalizeVoucher } = require('../common/voucher');

function loadModel(file, database) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    module, exports: module.exports,
    require: (name) => name === '../common/db' ? database : require(name),
  });
  return module.exports;
}

const callbackResult = (work) => new Promise((resolve, reject) =>
  work((error, result) => error ? reject(error) : resolve(result)));

async function main() {
  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    // Keep model transactions inside an outer rollback so no test rows remain.
    const transactional = {
      query: connection.query.bind(connection),
      beginTransaction: () => connection.query('SAVEPOINT voucher_operation'),
      commit: () => connection.query('RELEASE SAVEPOINT voucher_operation'),
      rollback: () => connection.query('ROLLBACK TO SAVEPOINT voucher_operation'),
      release() {},
    };
    const callbackConnection = {
      query: connection.connection.query.bind(connection.connection),
      beginTransaction: (cb) => connection.connection.query('SAVEPOINT voucher_operation', cb),
      commit: (cb) => connection.connection.query('RELEASE SAVEPOINT voucher_operation', cb),
      rollback: (cb) => connection.connection.query('ROLLBACK TO SAVEPOINT voucher_operation', cb),
      release() {},
    };
    const database = {
      query: callbackConnection.query,
      getConnection: (cb) => cb(null, callbackConnection),
      promise: () => ({ query: connection.query.bind(connection), getConnection: async () => transactional }),
    };
    const admin = loadModel('models/adminModel.js', database);
    const vouchers = loadModel('models/magiamgiaModel.js', database);
    const orders = loadModel('models/donhangModel.js', database);
    const [[address]] = await connection.query(
      "SELECT dc.MaDiaChi, dc.MaNguoiDung FROM diachi dc JOIN nguoidung nd ON nd.MaNguoiDung = dc.MaNguoiDung WHERE nd.VaiTro = 'user' AND nd.TrangThai = 'active' LIMIT 1",
    );
    const [[variant]] = await connection.query(
      "SELECT bt.* FROM bienthesanpham bt JOIN sanpham sp ON sp.MaSanPham = bt.MaSanPham WHERE bt.SoLuongTon > 0 AND bt.GiaBan > 0 AND bt.TrangThai = 'active' AND sp.TrangThai <> 'inactive' LIMIT 1",
    );
    assert.ok(address && variant, 'Integration check needs a customer address and an in-stock product.');
    const code = `VOUCHER_CHECK_${Date.now()}`;
    const id = await admin.createVoucher(normalizeVoucher({
      code, name: 'Temporary voucher integration check', discountType: 'phan_tram', discountValue: 10,
      minOrderValue: 0, maxDiscount: 50000, quantity: 2,
      startsAt: new Date(Date.now() - 86400000).toISOString().slice(0, 19),
      endsAt: new Date(Date.now() + 86400000).toISOString().slice(0, 19), status: 'active',
    }));
    const preview = () => callbackResult((cb) => vouchers.validate({ code, subtotal: Number(variant.GiaBan), userId: address.MaNguoiDung }, cb));
    const before = await preview();
    const payload = {
      userId: address.MaNguoiDung, addressId: address.MaDiaChi, voucherId: id,
      items: [{ MaSanPham: variant.MaSanPham, MaBienThe: variant.MaBienThe, SoLuong: 1 }],
    };
    const order = await callbackResult((cb) => orders.createCheckout(payload, cb));
    assert.equal(Number(order.SoTienGiam), before.SoTienGiam);
    await assert.rejects(preview(), { status: 400 });
    await assert.rejects(callbackResult((cb) => orders.createCheckout(payload, cb)), { status: 400 });
    const available = await callbackResult((cb) => vouchers.getAvailable(address.MaNguoiDung, cb));
    assert.ok(!available.some((voucher) => voucher.MaGiamGia === id));
    await admin.deleteVoucher(id);
    const [[paused]] = await connection.query('SELECT TrangThai, SoLuong FROM magiamgia WHERE MaGiamGia = ?', [id]);
    assert.equal(paused.TrangThai, 'inactive');
    assert.equal(paused.SoLuong, 1);
    await admin.updateVoucher(id, { TrangThai: 'active' });
    await callbackResult((cb) => orders.cancelForUser(address.MaNguoiDung, order.MaDonHang, cb));
    assert.equal((await preview()).SoLuong, 2);
    await assert.rejects(callbackResult((cb) => orders.cancelForUser(address.MaNguoiDung, order.MaDonHang, cb)), { status: 400 });
    const secondOrder = await callbackResult((cb) => orders.createCheckout(payload, cb));
    await admin.updateOrderStatus(secondOrder.MaDonHang, 'cancelled');
    await admin.updateOrderStatus(secondOrder.MaDonHang, 'cancelled');
    assert.equal((await preview()).SoLuong, 2);
    const [[restoredVariant]] = await connection.query('SELECT SoLuongTon FROM bienthesanpham WHERE MaBienThe = ?', [variant.MaBienThe]);
    assert.equal(restoredVariant.SoLuongTon, variant.SoLuongTon);
    console.log('MySQL voucher check passed: preview, checkout, single use, soft delete, user/admin cancellation.');
  } finally {
    await connection.rollback();
    connection.release();
    await pool.promise().end();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
