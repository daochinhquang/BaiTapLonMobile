const assert = require('node:assert/strict');
const { test } = require('node:test');

const {
  normalizeProductVariants,
  summarizeProductVariants,
} = require('../common/productVariant');

test('product variants normalize values and derive status', () => {
  const variants = normalizeProductVariants([
    { color: ' Trắng ', price: '1200000', size: ' 40 ', stock: '3' },
    { color: 'Đen', price: 1250000, size: '41', stock: 0 },
  ]);

  assert.deepEqual(variants, [
    { color: 'Trắng', id: null, price: 1200000, size: '40', status: 'active', stock: 3 },
    { color: 'Đen', id: null, price: 1250000, size: '41', status: 'out_of_stock', stock: 0 },
  ]);
});

test('duplicate size and color pairs are rejected case-insensitively', () => {
  assert.throws(
    () => normalizeProductVariants([
      { color: 'Đen', price: 10, size: 'M', stock: 1 },
      { color: 'đen', price: 10, size: 'm', stock: 1 },
    ]),
    /đã bị trùng/
  );
});

test('variant summary uses the minimum price and total active stock', () => {
  const summary = summarizeProductVariants(normalizeProductVariants([
    { color: 'Đỏ', price: 500, size: 'S', stock: 2 },
    { color: 'Xanh', price: 450, size: 'M', stock: 4 },
    { color: 'Đen', price: 400, size: 'L', status: 'inactive', stock: 8 },
  ]));

  assert.deepEqual(summary, { price: 450, stock: 6 });
});
