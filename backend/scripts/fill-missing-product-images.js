const fs = require('node:fs');
const path = require('node:path');

const pool = require('../common/db').promise();

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const imageFilesByCategory = new Map([
  ['Bóng thi đấu', ['bong6.jpg', 'bong4.webp', 'bong-chuyen-geru-star-3.jpg']],
  ['Bóng luyện tập', ['bong2.jpg', 'bong5.jpg', 'bong4.webp']],
  [
    'Giày trong nhà',
    [
      'giay1.jpg',
      'giay2.webp',
      'giay3.webp',
      'giay4.jpg',
      'giay5.webp',
      'giay6.webp',
      'giay7.webp',
      'giay8.webp',
    ],
  ],
  ['Bó gối', ['bogoi2.jpg', 'bogoi3.jpg', 'bogoi4.jpg']],
  ['Áo luyện tập', ['ao1.webp', 'ao2.jpg', 'ao3.jpg', 'ao4.jpg']],
]);

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function readImageDataUrl(imageFolder, fileName) {
  const filePath = path.join(imageFolder, fileName);
  const extension = path.extname(fileName).toLowerCase();
  const mimeType = mimeTypes[extension];

  if (!mimeType) {
    throw new Error(`Unsupported image type: ${fileName}`);
  }

  const stat = fs.statSync(filePath);
  if (stat.size > MAX_IMAGE_BYTES) {
    throw new Error(`Image exceeds 4 MB: ${fileName}`);
  }

  const base64 = fs.readFileSync(filePath).toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

async function main() {
  const imageFolder = process.argv[2];
  if (!imageFolder) {
    throw new Error('Usage: node scripts/fill-missing-product-images.js <image-folder>');
  }

  const resolvedFolder = path.resolve(imageFolder);
  const dataUrls = new Map();

  for (const fileNames of imageFilesByCategory.values()) {
    for (const fileName of fileNames) {
      if (!dataUrls.has(fileName)) {
        dataUrls.set(fileName, readImageDataUrl(resolvedFolder, fileName));
      }
    }
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const [products] = await connection.query(
      `SELECT sp.MaSanPham, lsp.TenLoaiSanPham
       FROM sanpham sp
       JOIN loaisanpham lsp ON lsp.MaLoaiSanPham = sp.MaLoaiSanPham
       WHERE sp.AnhDaiDien IS NULL OR TRIM(sp.AnhDaiDien) = ''
       ORDER BY sp.MaSanPham
       FOR UPDATE`,
    );

    const categoryIndexes = new Map();
    const updatedByCategory = {};

    for (const product of products) {
      const fileNames = imageFilesByCategory.get(product.TenLoaiSanPham);
      if (!fileNames) {
        throw new Error(`No image mapping for category: ${product.TenLoaiSanPham}`);
      }

      const index = categoryIndexes.get(product.TenLoaiSanPham) || 0;
      const fileName = fileNames[index % fileNames.length];
      const [result] = await connection.query(
        `UPDATE sanpham
         SET AnhDaiDien = ?
         WHERE MaSanPham = ?
           AND (AnhDaiDien IS NULL OR TRIM(AnhDaiDien) = '')`,
        [dataUrls.get(fileName), product.MaSanPham],
      );

      if (result.affectedRows !== 1) {
        throw new Error(`Product ${product.MaSanPham} was not updated`);
      }

      categoryIndexes.set(product.TenLoaiSanPham, index + 1);
      updatedByCategory[product.TenLoaiSanPham] =
        (updatedByCategory[product.TenLoaiSanPham] || 0) + 1;
    }

    await connection.commit();
    console.log(JSON.stringify({ totalUpdated: products.length, updatedByCategory }, null, 2));
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
