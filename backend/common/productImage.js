const MAX_PRODUCT_IMAGE_BYTES = 4 * 1024 * 1024;

function normalizeProductImage(value) {
  const image = typeof value === 'string' ? value.trim() : '';

  if (!image) {
    return null;
  }

  if (/^https?:\/\//i.test(image)) {
    if (image.length > 2048) {
      const error = new Error('Đường dẫn ảnh sản phẩm quá dài.');
      error.status = 400;
      throw error;
    }

    return image;
  }

  const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i);

  if (!match) {
    const error = new Error('Ảnh sản phẩm phải là JPG, PNG, WEBP hoặc một URL hợp lệ.');
    error.status = 400;
    throw error;
  }

  if (Buffer.byteLength(match[2], 'base64') > MAX_PRODUCT_IMAGE_BYTES) {
    const error = new Error('Ảnh sản phẩm không được lớn hơn 4 MB.');
    error.status = 413;
    throw error;
  }

  return image;
}

module.exports = { MAX_PRODUCT_IMAGE_BYTES, normalizeProductImage };
