const assert = require('node:assert/strict');
const { test } = require('node:test');

const {
  MAX_PRODUCT_IMAGE_BYTES,
  normalizeProductImage,
} = require('../common/productImage');

test('accepts supported product image data URLs', () => {
  const image = 'data:image/png;base64,iVBORw0KGgo=';
  assert.equal(normalizeProductImage(image), image);
});

test('accepts HTTP image URLs and empty values', () => {
  assert.equal(normalizeProductImage('https://example.com/product.webp'), 'https://example.com/product.webp');
  assert.equal(normalizeProductImage(''), null);
});

test('rejects unsupported product image values', () => {
  assert.throws(
    () => normalizeProductImage('not-an-image'),
    (error) => error.status === 400
  );
  assert.throws(
    () => normalizeProductImage('data:image/gif;base64,R0lGODlh'),
    (error) => error.status === 400
  );
});

test('rejects product images larger than four megabytes', () => {
  const oversizedImage = `data:image/jpeg;base64,${Buffer.alloc(MAX_PRODUCT_IMAGE_BYTES + 1).toString('base64')}`;
  assert.throws(
    () => normalizeProductImage(oversizedImage),
    (error) => error.status === 413
  );
});
