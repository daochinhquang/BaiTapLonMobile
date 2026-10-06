const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function checkout(items, method = 'COD') {
  let payload;
  let status;
  const sandbox = {
    exports: {},
    require: () => ({ createCheckout: (value) => { payload = value; } }),
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../controllers/donhangController.js'), 'utf8'), sandbox);
  const response = { status(value) { status = value; return this; }, json() {} };
  sandbox.exports.checkout({ body: { MaNguoiDung: 1, MaDiaChi: 1, items, PhuongThucThanhToan: method } }, response);
  return { payload, status };
}

test('duplicate variants are combined before stock validation', () => {
  const { payload } = checkout([
    { MaBienThe: 12, MaSanPham: 2, SoLuong: 3 },
    { MaBienThe: 12, MaSanPham: 2, SoLuong: 4 },
  ]);
  assert.equal(payload.items.length, 1);
  assert.equal(payload.items[0].SoLuong, 7);
  assert.equal(payload.items[0].MaBienThe, 12);
});

test('invalid quantities reject the entire order', () => {
  for (const quantity of [0, -1, 1.5, 'bad']) {
    const result = checkout([
      { MaBienThe: 12, MaSanPham: 2, SoLuong: 1 },
      { MaBienThe: 13, MaSanPham: 3, SoLuong: quantity },
    ]);
    assert.equal(result.status, 400);
    assert.equal(result.payload, undefined);
  }
  assert.equal(checkout([null]).status, 400);
});

test('unintegrated payment methods cannot create paid orders', () => {
  assert.equal(checkout([{ MaBienThe: 12, MaSanPham: 2, SoLuong: 1 }], 'VNPay').status, 400);
});
