const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { calculateVoucherDiscount, normalizeVoucher } = require('../common/voucher');

const validForm = {
  code: ' volley10 ', name: 'Voucher test', discountType: 'phan_tram',
  discountValue: 10, minOrderValue: 100000, maxDiscount: 50000,
  quantity: 3, startsAt: '2026-01-01T00:00', endsAt: '2027-01-01T00:00', status: 'active',
};

test('voucher discounts respect percentage, fixed amount, cap and order subtotal', () => {
  const voucher = normalizeVoucher(validForm);
  assert.equal(calculateVoucherDiscount(voucher, 200000), 20000);
  assert.equal(calculateVoucherDiscount(voucher, 1000000), 50000);
  assert.equal(calculateVoucherDiscount({ ...voucher, MucGiamToiDa: 0 }, 200000), 0);
  assert.equal(calculateVoucherDiscount({ ...voucher, LoaiGiam: 'tien_mat', GiaTriGiam: 300000, MucGiamToiDa: null }, 200000), 200000);
  assert.equal(calculateVoucherDiscount({ ...voucher, MucGiamToiDa: null }, 123456.78), 12345.68);
});

test('admin voucher validation rejects invalid dates, amounts, types and quantities', () => {
  const voucher = normalizeVoucher(validForm);
  assert.equal(voucher.MaCode, 'VOLLEY10');
  assert.equal(voucher.NgayBatDau, '2026-01-01 00:00:00');
  assert.equal(normalizeVoucher({ ...validForm, maxDiscount: '' }).MucGiamToiDa, null);
  for (const patch of [
    { code: 'bad code' }, { code: 'x'.repeat(51) }, { name: '' },
    { discountValue: 101 }, { discountValue: 0 }, { discountValue: 'bad' },
    { discountType: 'unknown' }, { minOrderValue: -1 }, { maxDiscount: -1 },
    { quantity: 1.5 }, { quantity: -1 }, { quantity: 2147483648 }, { quantity: null },
    { startsAt: '2026-02-30T10:00' }, { endsAt: '2025-01-01T00:00' },
    { endsAt: '2027-01-01T25:00' }, { status: 'unknown' },
  ]) {
    assert.throws(() => normalizeVoucher({ ...validForm, ...patch }), { status: 400 });
  }
});

function loadModel(file, database) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    module, exports: module.exports,
    require: (name) => name === '../common/db' ? database : require(name),
  });
  return module.exports;
}

function callbackResult(work) {
  return new Promise((resolve, reject) => work((error, result) => error ? reject(error) : resolve(result)));
}

test('voucher preview enforces minimum order and one use per account', async () => {
  let used = false;
  let available = true;
  const voucher = { ...normalizeVoucher(validForm), MaGiamGia: 4 };
  const model = loadModel('models/magiamgiaModel.js', {
    query(sql, params, callback) {
      if (sql.includes('FROM `nguoidungmagiamgia`')) {
        assert.deepEqual(Array.from(params), [4, 7]);
        return callback(null, [{ DaSuDung: used }]);
      }
      return callback(null, available ? [voucher] : []);
    },
  });
  const validate = (subtotal) => callbackResult((cb) => model.validate({ code: 'VOLLEY10', subtotal, userId: 7 }, cb));
  assert.equal((await validate(200000)).SoTienGiam, 20000);
  await assert.rejects(validate(99999), { status: 400 });
  used = true;
  await assert.rejects(validate(200000), { status: 400 });
  available = false;
  await assert.rejects(validate(200000), { status: 404 });
});

function checkoutDatabase() {
  const state = { remaining: 3, used: false, order: null, paymentFails: false };
  const voucher = { ...normalizeVoucher(validForm), MaGiamGia: 4 };
  let snapshot;
  function query(sql, params, callback) {
    const text = sql.replace(/`/g, '').replace(/\s+/g, ' ').trim();
    let result = { affectedRows: 1 };
    if (text.startsWith('SELECT * FROM diachi')) result = [{ MaDiaChi: 1 }];
    else if (text.includes('FROM bienthesanpham bt')) result = [{
      MaBienThe: 31, MaSanPham: 8, SoLuongTon: 10, GiaBan: 200000,
      TrangThai: 'active', TrangThaiSanPham: 'active', TenSanPham: 'Test',
    }];
    else if (text.startsWith('SELECT * FROM magiamgia')) {
      assert.match(text, /FOR UPDATE$/);
      result = state.remaining > 0 ? [{ ...voucher, SoLuong: state.remaining }] : [];
    } else if (text.startsWith('SELECT DaSuDung')) result = [{ DaSuDung: state.used }];
    else if (text.startsWith('INSERT INTO donhang')) {
      state.order = {
        MaDonHang: 9, MaNguoiDung: params[0], MaGiamGia: params[2],
        TongTienHang: params[3], SoTienGiam: params[4], TongThanhToan: params[6], TrangThaiDonHang: 'pending',
      };
      result = { insertId: 9 };
    } else if (text.startsWith('UPDATE magiamgia')) state.remaining += text.includes('- 1') ? -1 : 1;
    else if (text.startsWith('INSERT INTO nguoidungmagiamgia')) state.used = true;
    else if (text.startsWith('UPDATE nguoidungmagiamgia')) state.used = false;
    else if (text.startsWith('INSERT INTO thanhtoan') && state.paymentFails) return callback(new Error('Payment insert failed'));
    else if (text.startsWith('SELECT * FROM donhang') || text.includes('FROM donhang dh')) result = [state.order];
    else if (text.startsWith('SELECT * FROM chitietdonhang')) result = [{ MaBienThe: 31, MaSanPham: 8, SoLuong: 1 }];
    else if (text.startsWith('UPDATE donhang')) state.order.TrangThaiDonHang = 'cancelled';
    else if (text.includes('FROM chitietdonhang ctdh')) result = [];
    callback(null, result);
  }
  const connection = {
    query,
    beginTransaction(cb) { snapshot = structuredClone(state); cb(null); },
    commit(cb) { cb(null); },
    rollback(cb) { Object.assign(state, snapshot); cb(); },
    release() {},
  };
  return { state, database: { query, getConnection: (cb) => cb(null, connection) } };
}

test('checkout consumes a voucher once and cancellation restores its availability once', async () => {
  const { state, database } = checkoutDatabase();
  const model = loadModel('models/donhangModel.js', database);
  const payload = { userId: 7, addressId: 1, voucherCode: 'VOLLEY10', items: [{ MaSanPham: 8, MaBienThe: 31, SoLuong: 1 }] };
  const checkout = () => callbackResult((cb) => model.createCheckout(payload, cb));
  const order = await checkout();
  assert.equal(order.MaGiamGia, 4);
  assert.equal(order.SoTienGiam, 20000);
  assert.equal(order.TongThanhToan, 210000);
  assert.equal(state.remaining, 2);
  assert.equal(state.used, true);
  await assert.rejects(checkout(), { status: 400 });
  assert.equal(state.remaining, 2);
  await callbackResult((cb) => model.cancelForUser(7, 9, cb));
  assert.equal(state.remaining, 3);
  assert.equal(state.used, false);
  await assert.rejects(callbackResult((cb) => model.cancelForUser(7, 9, cb)), { status: 400 });
  assert.equal(state.remaining, 3);
  await checkout();
  assert.equal(state.remaining, 2);
});

test('failed checkout rolls back voucher consumption and usage', async () => {
  const { state, database } = checkoutDatabase();
  state.paymentFails = true;
  const model = loadModel('models/donhangModel.js', database);
  await assert.rejects(callbackResult((cb) => model.createCheckout({
    userId: 7, addressId: 1, voucherId: 4, items: [{ MaSanPham: 8, MaBienThe: 31, SoLuong: 1 }],
  }, cb)), /Payment insert failed/);
  assert.equal(state.remaining, 3);
  assert.equal(state.used, false);
  assert.equal(state.order, null);
});

test('admin cancellation restores a voucher only on the first status change', async () => {
  const state = { status: 'pending', remaining: 2, used: true };
  const connection = {
    async beginTransaction() {}, async commit() {}, async rollback() {}, release() {},
    async query(sql) {
      if (sql.includes('SELECT TrangThaiDonHang AS status')) return [[{
        status: state.status, paymentStatus: 'unpaid', paymentMethod: 'COD', voucherId: 4, userId: 7,
      }]];
      if (sql.includes('FROM chitietdonhang')) return [[]];
      if (sql.includes('UPDATE magiamgia')) state.remaining++;
      if (sql.includes('UPDATE nguoidungmagiamgia')) state.used = false;
      if (sql.includes('UPDATE donhang')) state.status = 'cancelled';
      return [{ affectedRows: 1 }];
    },
  };
  const model = loadModel('models/adminModel.js', { promise: () => ({ getConnection: async () => connection }) });
  await model.updateOrderStatus(9, 'cancelled');
  await model.updateOrderStatus(9, 'cancelled');
  assert.equal(state.remaining, 3);
  assert.equal(state.used, false);
});

test('deleting vouchers preserves used codes and removes unused codes', async () => {
  for (const used of [false, true]) {
    let action;
    const connection = {
      async beginTransaction() {}, async commit() {}, async rollback() {}, release() {},
      async query(sql) {
        if (sql.includes('SELECT MaGiamGia')) return [[{ MaGiamGia: 4 }]];
        if (sql.includes('AS orderTotal')) return [[{ orderTotal: Number(used) }]];
        if (sql.includes('AS userTotal')) return [[{ userTotal: 0 }]];
        action = sql;
        return [{ affectedRows: 1 }];
      },
    };
    const model = loadModel('models/adminModel.js', { promise: () => ({ getConnection: async () => connection }) });
    await model.deleteVoucher(4);
    assert.match(action, used ? /UPDATE magiamgia SET TrangThai = 'inactive'/ : /DELETE FROM magiamgia/);
  }
});
