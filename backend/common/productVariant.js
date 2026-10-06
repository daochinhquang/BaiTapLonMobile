function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function nonNegativeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function nonNegativeInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

function normalizeProductVariants(variants, fallback = {}) {
  const source = Array.isArray(variants) && variants.length
    ? variants
    : [{
        color: '',
        price: fallback.price,
        size: '',
        stock: fallback.stock,
      }];
  const seen = new Set();

  return source.map((variant, index) => {
    const size = text(variant?.size ?? variant?.KichThuoc);
    const color = text(variant?.color ?? variant?.MauSac);
    const price = nonNegativeNumber(variant?.price ?? variant?.GiaBan);
    const stock = nonNegativeInteger(variant?.stock ?? variant?.SoLuongTon);
    const rawId = variant?.id ?? variant?.MaBienThe;
    const id = rawId === undefined || rawId === null || rawId === '' ? null : Number(rawId);

    if (price === null || stock === null || (id !== null && (!Number.isSafeInteger(id) || id <= 0))) {
      const error = new Error(`Biến thể ${index + 1} có giá, tồn kho hoặc mã không hợp lệ.`);
      error.status = 400;
      throw error;
    }

    const key = `${size.toLocaleLowerCase('vi')}\u0000${color.toLocaleLowerCase('vi')}`;
    if (seen.has(key)) {
      const error = new Error(`Biến thể ${size || 'không size'} / ${color || 'không màu'} đã bị trùng.`);
      error.status = 400;
      throw error;
    }
    seen.add(key);

    const requestedStatus = variant?.status ?? variant?.TrangThai;
    const status = requestedStatus === 'inactive'
      ? 'inactive'
      : stock === 0
        ? 'out_of_stock'
        : 'active';

    return { color, id, price, size, status, stock };
  });
}

function summarizeProductVariants(variants) {
  const activeVariants = variants.filter((variant) => variant.status !== 'inactive');
  const variantsForPrice = activeVariants.length ? activeVariants : variants;
  const price = variantsForPrice.length
    ? Math.min(...variantsForPrice.map((variant) => variant.price))
    : 0;
  const stock = activeVariants.reduce((total, variant) => total + variant.stock, 0);

  return { price, stock };
}

module.exports = { normalizeProductVariants, summarizeProductVariants };
