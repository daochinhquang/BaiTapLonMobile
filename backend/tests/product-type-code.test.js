const assert = require('node:assert/strict');
const test = require('node:test');

const { normalizeProductTypeCode } = require('../common/productTypeCode');

test('accepts numeric and formatted product type codes', () => {
  assert.equal(normalizeProductTypeCode(12), 12);
  assert.equal(normalizeProductTypeCode('12'), 12);
  assert.equal(normalizeProductTypeCode('LSP012'), 12);
  assert.equal(normalizeProductTypeCode('lsp0007'), 7);
});

test('rejects invalid product type codes', () => {
  for (const value of ['', 'LSP', 'ABC12', 'LSP-1', 0, -1, null]) {
    assert.throws(
      () => normalizeProductTypeCode(value),
      (error) => error.status === 400
    );
  }
});
