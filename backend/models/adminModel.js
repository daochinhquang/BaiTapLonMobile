const pool = require("../common/db");

const db = pool.promise();

async function rows(sql, params = []) {
  const [result] = await db.query(sql, params);
  return result;
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function variantRow(productId, variant) {
  return {
    GiaBan: variant.price,
    KichThuoc: variant.size,
    MaSanPham: productId,
    MauSac: variant.color,
    SoLuongTon: variant.stock,
    TrangThai: variant.status,
  };
}

async function syncProductVariants(connection, productId, variants) {
  const [existingRows] = await connection.query(
    "SELECT MaBienThe FROM bienthesanpham WHERE MaSanPham = ? FOR UPDATE",
    [productId],
  );
  const existingIds = new Set(existingRows.map((row) => Number(row.MaBienThe)));
  const retainedIds = new Set();

  for (const variant of variants) {
    if (variant.id !== null) {
      if (!existingIds.has(Number(variant.id))) {
        throw createHttpError(
          400,
          "Có biến thể không thuộc sản phẩm đang chỉnh sửa.",
        );
      }
      retainedIds.add(Number(variant.id));
      await connection.query(
        "UPDATE bienthesanpham SET ? WHERE MaBienThe = ? AND MaSanPham = ?",
        [variantRow(productId, variant), variant.id, productId],
      );
    } else {
      const [result] = await connection.query(
        `INSERT INTO bienthesanpham SET ?
         ON DUPLICATE KEY UPDATE
           MaBienThe = LAST_INSERT_ID(MaBienThe),
           GiaBan = VALUES(GiaBan),
           SoLuongTon = VALUES(SoLuongTon),
           TrangThai = VALUES(TrangThai)`,
        [variantRow(productId, variant)],
      );
      retainedIds.add(Number(result.insertId));
    }
  }

  const removedIds = [...existingIds].filter((id) => !retainedIds.has(id));
  if (removedIds.length) {
    await connection.query(
      "UPDATE bienthesanpham SET TrangThai = 'inactive', SoLuongTon = 0 WHERE MaSanPham = ? AND MaBienThe IN (?)",
      [productId, removedIds],
    );
  }
}

async function getDashboard() {
  const [summary] = await rows(`
    SELECT
      (SELECT COALESCE(SUM(TongThanhToan), 0)
       FROM donhang
       WHERE TrangThaiDonHang = 'completed') AS revenue,
      (SELECT COUNT(*) FROM donhang) AS orders,
      (SELECT COUNT(*) FROM sanpham WHERE TrangThai <> 'inactive') AS products,
      (SELECT COUNT(*) FROM nguoidung WHERE VaiTro = 'user') AS customers
  `);
  const monthlyRevenue = await rows(`
    SELECT MONTH(NgayTao) AS month, COALESCE(SUM(TongThanhToan), 0) AS revenue
    FROM donhang
    WHERE YEAR(NgayTao) = YEAR(CURRENT_DATE())
      AND TrangThaiDonHang <> 'cancelled'
    GROUP BY MONTH(NgayTao)
    ORDER BY month
  `);
  const orderStatuses = await rows(`
    SELECT TrangThaiDonHang AS status, COUNT(*) AS total
    FROM donhang
    GROUP BY TrangThaiDonHang
  `);
  const recentOrders = await rows(`
    SELECT
      dh.MaDonHang AS id,
      nd.HoTen AS customer,
      dh.NgayTao AS createdAt,
      dh.TongThanhToan AS total,
      dh.TrangThaiDonHang AS status
    FROM donhang dh
    INNER JOIN nguoidung nd ON nd.MaNguoiDung = dh.MaNguoiDung
    ORDER BY dh.NgayTao DESC, dh.MaDonHang DESC
    LIMIT 6
  `);
  const topProducts = await rows(`
    SELECT
      sp.MaSanPham AS id,
      sp.TenSanPham AS name,
      lsp.TenLoaiSanPham AS category,
      COALESCE(SUM(CASE WHEN dh.TrangThaiDonHang <> 'cancelled' THEN ctdh.SoLuong ELSE 0 END), 0) AS sold
    FROM sanpham sp
    LEFT JOIN loaisanpham lsp ON lsp.MaLoaiSanPham = sp.MaLoaiSanPham
    LEFT JOIN chitietdonhang ctdh ON ctdh.MaSanPham = sp.MaSanPham
    LEFT JOIN donhang dh ON dh.MaDonHang = ctdh.MaDonHang
    GROUP BY sp.MaSanPham, sp.TenSanPham, lsp.TenLoaiSanPham
    ORDER BY sold DESC, sp.MaSanPham DESC
    LIMIT 5
  `);

  return { monthlyRevenue, orderStatuses, recentOrders, summary, topProducts };
}

async function getStatistics() {
  const [overview] = await rows(`
    SELECT
      (SELECT COALESCE(SUM(TongThanhToan), 0)
       FROM donhang
       WHERE NgayTao >= CURRENT_DATE() - INTERVAL 6 DAY
         AND TrangThaiDonHang <> 'cancelled') AS revenue,
      (SELECT COUNT(*)
       FROM donhang
       WHERE NgayTao >= CURRENT_DATE() - INTERVAL 6 DAY) AS orders,
      (SELECT COALESCE(SUM(ctdh.SoLuong), 0)
       FROM chitietdonhang ctdh
       INNER JOIN donhang dh ON dh.MaDonHang = ctdh.MaDonHang
       WHERE dh.NgayTao >= CURRENT_DATE() - INTERVAL 6 DAY
         AND dh.TrangThaiDonHang <> 'cancelled') AS productsSold,
      (SELECT COUNT(*)
       FROM nguoidung
       WHERE VaiTro = 'user'
         AND NgayTao >= CURRENT_DATE() - INTERVAL 6 DAY) AS customers
  `);
  const dailyRevenue = await rows(`
    SELECT DATE(NgayTao) AS day, COALESCE(SUM(TongThanhToan), 0) AS revenue
    FROM donhang
    WHERE NgayTao >= CURRENT_DATE() - INTERVAL 6 DAY
      AND TrangThaiDonHang <> 'cancelled'
    GROUP BY DATE(NgayTao)
    ORDER BY day
  `);
  const topProducts = await rows(`
    SELECT
      sp.TenSanPham AS name,
      lsp.TenLoaiSanPham AS category,
      COALESCE(SUM(ctdh.SoLuong), 0) AS quantity,
      COALESCE(SUM(ctdh.ThanhTien), 0) AS revenue
    FROM chitietdonhang ctdh
    INNER JOIN donhang dh ON dh.MaDonHang = ctdh.MaDonHang
    INNER JOIN sanpham sp ON sp.MaSanPham = ctdh.MaSanPham
    LEFT JOIN loaisanpham lsp ON lsp.MaLoaiSanPham = sp.MaLoaiSanPham
    WHERE dh.TrangThaiDonHang <> 'cancelled'
    GROUP BY sp.MaSanPham, sp.TenSanPham, lsp.TenLoaiSanPham
    ORDER BY quantity DESC, revenue DESC
    LIMIT 5
  `);
  const categories = await rows(`
    SELECT
      lsp.TenLoaiSanPham AS name,
      COALESCE(SUM(ctdh.ThanhTien), 0) AS revenue
    FROM loaisanpham lsp
    LEFT JOIN sanpham sp ON sp.MaLoaiSanPham = lsp.MaLoaiSanPham
    LEFT JOIN chitietdonhang ctdh ON ctdh.MaSanPham = sp.MaSanPham
    LEFT JOIN donhang dh ON dh.MaDonHang = ctdh.MaDonHang
      AND dh.TrangThaiDonHang <> 'cancelled'
    GROUP BY lsp.MaLoaiSanPham, lsp.TenLoaiSanPham
    ORDER BY revenue DESC
    LIMIT 5
  `);
  const orderStatuses = await rows(`
    SELECT TrangThaiDonHang AS status, COUNT(*) AS total
    FROM donhang
    GROUP BY TrangThaiDonHang
  `);

  return { categories, dailyRevenue, orderStatuses, overview, topProducts };
}

async function listProducts() {
  const products = await rows(`
    SELECT
      sp.MaSanPham AS id,
      sp.TenSanPham AS name,
      sp.MaLoaiSanPham AS typeId,
      lsp.TenLoaiSanPham AS typeName,
      sp.MaNhaCungCap AS supplierId,
      ncc.TenNhaCungCap AS supplierName,
      sp.ThuongHieu AS brand,
      sp.GiaBan AS price,
      sp.SoLuongTon AS stock,
      sp.MoTa AS description,
      sp.AnhDaiDien AS image,
      sp.TrangThai AS status
    FROM sanpham sp
    INNER JOIN loaisanpham lsp ON lsp.MaLoaiSanPham = sp.MaLoaiSanPham
    INNER JOIN nhacungcap ncc ON ncc.MaNhaCungCap = sp.MaNhaCungCap
    WHERE sp.TrangThai <> 'inactive'
    ORDER BY sp.MaSanPham DESC
  `);
  const variants = await rows(`
    SELECT
      MaBienThe AS id,
      MaSanPham AS productId,
      KichThuoc AS size,
      MauSac AS color,
      GiaBan AS price,
      SoLuongTon AS stock,
      TrangThai AS status
    FROM bienthesanpham
    WHERE TrangThai <> 'inactive'
    ORDER BY MaSanPham DESC, MaBienThe
  `);
  const variantsByProduct = new Map();
  for (const variant of variants) {
    const list = variantsByProduct.get(Number(variant.productId)) || [];
    list.push(variant);
    variantsByProduct.set(Number(variant.productId), list);
  }

  return products.map((product) => ({
    ...product,
    variants: variantsByProduct.get(Number(product.id)) || [],
  }));
}

async function createProduct(product) {
  const connection = await db.getConnection();
  const { variants, ...productData } = product;
  try {
    await connection.beginTransaction();
    const [result] = await connection.query("INSERT INTO sanpham SET ?", [
      productData,
    ]);
    await syncProductVariants(connection, result.insertId, variants);
    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateProduct(id, product) {
  const connection = await db.getConnection();
  const { variants, ...productData } = product;
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      "UPDATE sanpham SET ? WHERE MaSanPham = ?",
      [productData, id],
    );
    if (!result.affectedRows)
      throw createHttpError(404, "Không tìm thấy sản phẩm.");
    await syncProductVariants(connection, Number(id), variants);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteProduct(id) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      "UPDATE sanpham SET TrangThai = 'inactive' WHERE MaSanPham = ?",
      [id],
    );
    if (!result.affectedRows)
      throw createHttpError(404, "Không tìm thấy sản phẩm.");
    await connection.query(
      "UPDATE bienthesanpham SET TrangThai = 'inactive' WHERE MaSanPham = ?",
      [id],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listProductTypes() {
  return rows(`
    SELECT
      lsp.MaLoaiSanPham AS id,
      lsp.MaDanhMuc AS categoryId,
      dm.TenDanhMuc AS categoryName,
      lsp.TenLoaiSanPham AS name,
      lsp.MoTa AS description,
      lsp.TrangThai AS status,
      COUNT(sp.MaSanPham) AS productCount
    FROM loaisanpham lsp
    INNER JOIN danhmuc dm ON dm.MaDanhMuc = lsp.MaDanhMuc
    LEFT JOIN sanpham sp ON sp.MaLoaiSanPham = lsp.MaLoaiSanPham AND sp.TrangThai <> 'inactive'
    GROUP BY lsp.MaLoaiSanPham, lsp.MaDanhMuc, dm.TenDanhMuc,
      lsp.TenLoaiSanPham, lsp.MoTa, lsp.TrangThai
    ORDER BY lsp.MaLoaiSanPham DESC
  `);
}

async function listCategories() {
  return rows(`
    SELECT MaDanhMuc AS id, TenDanhMuc AS name
    FROM danhmuc
    WHERE TrangThai = 'active'
    ORDER BY TenDanhMuc
  `);
}

async function createProductType(productType, id = null) {
  const data =
    id === null ? productType : { ...productType, MaLoaiSanPham: id };
  const result = await rows("INSERT INTO loaisanpham SET ?", [data]);
  return result.insertId;
}

async function updateProductType(id, nextId, productType) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[existing]] = await connection.query(
      "SELECT MaLoaiSanPham FROM loaisanpham WHERE MaLoaiSanPham = ? FOR UPDATE",
      [id],
    );
    if (!existing) throw createHttpError(404, "Không tìm thấy loại sản phẩm.");

    if (Number(nextId) !== Number(id)) {
      const [[duplicate]] = await connection.query(
        "SELECT MaLoaiSanPham FROM loaisanpham WHERE MaLoaiSanPham = ? FOR UPDATE",
        [nextId],
      );
      if (duplicate)
        throw createHttpError(409, "Mã loại sản phẩm mới đã tồn tại.");
    }

    await connection.query(
      "UPDATE loaisanpham SET ?, MaLoaiSanPham = ? WHERE MaLoaiSanPham = ?",
      [productType, nextId, id],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteProductType(id) {
  const [{ total }] = await rows(
    "SELECT COUNT(*) AS total FROM sanpham WHERE MaLoaiSanPham = ? AND TrangThai <> 'inactive'",
    [id],
  );
  if (Number(total) > 0) {
    throw createHttpError(
      409,
      "Loại sản phẩm đang có sản phẩm nên không thể xóa.",
    );
  }
  const result = await rows("DELETE FROM loaisanpham WHERE MaLoaiSanPham = ?", [
    id,
  ]);
  if (!result.affectedRows)
    throw createHttpError(404, "Không tìm thấy loại sản phẩm.");
}

async function listSuppliers() {
  return rows(`
    SELECT
      ncc.MaNhaCungCap AS id,
      ncc.TenNhaCungCap AS name,
      ncc.NguoiLienHe AS contact,
      ncc.SoDienThoai AS phone,
      ncc.Email AS email,
      ncc.DiaChi AS address,
      ncc.MaSoThue AS taxCode,
      ncc.TrangThai AS status,
      COUNT(sp.MaSanPham) AS productCount
    FROM nhacungcap ncc
    LEFT JOIN sanpham sp ON sp.MaNhaCungCap = ncc.MaNhaCungCap AND sp.TrangThai <> 'inactive'
    GROUP BY ncc.MaNhaCungCap, ncc.TenNhaCungCap, ncc.NguoiLienHe,
      ncc.SoDienThoai, ncc.Email, ncc.DiaChi, ncc.MaSoThue, ncc.TrangThai
    ORDER BY ncc.MaNhaCungCap DESC
  `);
}

async function createSupplier(supplier) {
  const result = await rows("INSERT INTO nhacungcap SET ?", [supplier]);
  return result.insertId;
}

async function updateSupplier(id, supplier) {
  const result = await rows("UPDATE nhacungcap SET ? WHERE MaNhaCungCap = ?", [
    supplier,
    id,
  ]);
  if (!result.affectedRows)
    throw createHttpError(404, "Không tìm thấy nhà cung cấp.");
}

async function deleteSupplier(id) {
  const [{ total }] = await rows(
    "SELECT COUNT(*) AS total FROM sanpham WHERE MaNhaCungCap = ? AND TrangThai <> 'inactive'",
    [id],
  );
  if (Number(total) > 0) {
    throw createHttpError(
      409,
      "Nhà cung cấp đang có sản phẩm nên không thể xóa.",
    );
  }
  const result = await rows("DELETE FROM nhacungcap WHERE MaNhaCungCap = ?", [
    id,
  ]);
  if (!result.affectedRows)
    throw createHttpError(404, "Không tìm thấy nhà cung cấp.");
}

async function listImports() {
  const imports = await rows(`
    SELECT
      pn.MaPhieuNhap AS id,
      pn.MaNhaCungCap AS supplierId,
      ncc.TenNhaCungCap AS supplierName,
      pn.MaAdmin AS adminId,
      nd.HoTen AS adminName,
      pn.NgayNhap AS importedAt,
      pn.TongTien AS total,
      pn.GhiChu AS note,
      pn.TrangThai AS status,
      COUNT(ctpn.MaChiTietPhieuNhap) AS productCount,
      COALESCE(SUM(ctpn.SoLuong), 0) AS quantity
    FROM phieunhap pn
    INNER JOIN nhacungcap ncc ON ncc.MaNhaCungCap = pn.MaNhaCungCap
    INNER JOIN nguoidung nd ON nd.MaNguoiDung = pn.MaAdmin
    LEFT JOIN chitietphieunhap ctpn ON ctpn.MaPhieuNhap = pn.MaPhieuNhap
    GROUP BY pn.MaPhieuNhap, pn.MaNhaCungCap, ncc.TenNhaCungCap,
      pn.MaAdmin, nd.HoTen, pn.NgayNhap, pn.TongTien, pn.GhiChu, pn.TrangThai
    ORDER BY pn.NgayNhap DESC, pn.MaPhieuNhap DESC
  `);
  const items = await rows(`
    SELECT
      ctpn.MaPhieuNhap AS importId,
      ctpn.MaSanPham AS productId,
      ctpn.MaBienThe AS variantId,
      sp.TenSanPham AS productName,
      bt.KichThuoc AS size,
      bt.MauSac AS color,
      ctpn.SoLuong AS quantity,
      ctpn.GiaNhap AS unitPrice,
      ctpn.ThanhTien AS total
    FROM chitietphieunhap ctpn
    INNER JOIN sanpham sp ON sp.MaSanPham = ctpn.MaSanPham
    INNER JOIN bienthesanpham bt ON bt.MaBienThe = ctpn.MaBienThe
    ORDER BY ctpn.MaChiTietPhieuNhap
  `);
  const itemsByImport = new Map();
  for (const item of items) {
    const list = itemsByImport.get(Number(item.importId)) || [];
    list.push(item);
    itemsByImport.set(Number(item.importId), list);
  }

  return imports.map((item) => ({
    ...item,
    items: itemsByImport.get(Number(item.id)) || [],
  }));
}

async function createImport(data) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[admin]] = await connection.query(`
      SELECT MaNguoiDung AS id
      FROM nguoidung
      WHERE VaiTro = 'admin' AND TrangThai = 'active'
      ORDER BY MaNguoiDung
      LIMIT 1
    `);
    if (!admin)
      throw createHttpError(
        409,
        "Cần ít nhất một tài khoản admin đang hoạt động.",
      );

    const [[product]] = await connection.query(
      `SELECT sp.MaNhaCungCap AS supplierId, bt.MaBienThe AS variantId
       FROM sanpham sp
       INNER JOIN bienthesanpham bt ON bt.MaSanPham = sp.MaSanPham
       WHERE sp.MaSanPham = ? AND bt.MaBienThe = ? AND bt.TrangThai <> 'inactive'
       FOR UPDATE`,
      [data.productId, data.variantId],
    );
    if (!product)
      throw createHttpError(404, "Không tìm thấy sản phẩm nhập kho.");
    if (Number(product.supplierId) !== Number(data.supplierId)) {
      throw createHttpError(400, "Sản phẩm không thuộc nhà cung cấp đã chọn.");
    }

    const total = data.quantity * data.unitPrice;
    const [header] = await connection.query("INSERT INTO phieunhap SET ?", [
      {
        GhiChu: data.note || null,
        MaAdmin: admin.id,
        MaNhaCungCap: data.supplierId,
        NgayNhap: data.importedAt,
        TongTien: total,
        TrangThai: data.status,
      },
    ]);
    await connection.query("INSERT INTO chitietphieunhap SET ?", [
      {
        GiaNhap: data.unitPrice,
        MaPhieuNhap: header.insertId,
        MaSanPham: data.productId,
        MaBienThe: data.variantId,
        SoLuong: data.quantity,
      },
    ]);
    if (data.status === "completed") {
      await connection.query(
        `
        UPDATE bienthesanpham
        SET SoLuongTon = SoLuongTon + ?,
            TrangThai = CASE WHEN TrangThai = 'out_of_stock' THEN 'active' ELSE TrangThai END
        WHERE MaBienThe = ?
      `,
        [data.quantity, data.variantId],
      );
      await connection.query(
        `
        UPDATE sanpham
        SET SoLuongTon = SoLuongTon + ?,
            TrangThai = CASE WHEN TrangThai = 'out_of_stock' THEN 'active' ELSE TrangThai END
        WHERE MaSanPham = ?
      `,
        [data.quantity, data.productId],
      );
    }
    await connection.commit();
    return header.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function receiveImport(id) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[header]] = await connection.query(
      "SELECT TrangThai AS status FROM phieunhap WHERE MaPhieuNhap = ? FOR UPDATE",
      [id],
    );
    if (!header) throw createHttpError(404, "Không tìm thấy phiếu nhập.");
    if (header.status === "completed") {
      await connection.commit();
      return;
    }
    if (header.status !== "draft") {
      throw createHttpError(
        409,
        "Không thể xác nhận phiếu nhập ở trạng thái hiện tại.",
      );
    }

    const [items] = await connection.query(
      `SELECT MaSanPham AS productId, MaBienThe AS variantId, SoLuong AS quantity
       FROM chitietphieunhap WHERE MaPhieuNhap = ?`,
      [id],
    );
    for (const item of items) {
      await connection.query(
        `
        UPDATE bienthesanpham
        SET SoLuongTon = SoLuongTon + ?,
            TrangThai = CASE WHEN TrangThai = 'out_of_stock' THEN 'active' ELSE TrangThai END
        WHERE MaBienThe = ?
      `,
        [item.quantity, item.variantId],
      );
      await connection.query(
        `
        UPDATE sanpham
        SET SoLuongTon = SoLuongTon + ?,
            TrangThai = CASE WHEN TrangThai = 'out_of_stock' THEN 'active' ELSE TrangThai END
        WHERE MaSanPham = ?
      `,
        [item.quantity, item.productId],
      );
    }
    await connection.query(
      "UPDATE phieunhap SET TrangThai = 'completed' WHERE MaPhieuNhap = ?",
      [id],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteImport(id) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[header]] = await connection.query(
      "SELECT TrangThai AS status FROM phieunhap WHERE MaPhieuNhap = ? FOR UPDATE",
      [id],
    );
    if (!header) throw createHttpError(404, "Không tìm thấy phiếu nhập.");
    const [items] = await connection.query(
      `SELECT MaSanPham AS productId, MaBienThe AS variantId, SoLuong AS quantity
       FROM chitietphieunhap WHERE MaPhieuNhap = ?`,
      [id],
    );
    if (header.status === "completed") {
      for (const item of items) {
        const [[variant]] = await connection.query(
          "SELECT SoLuongTon AS stock FROM bienthesanpham WHERE MaBienThe = ? FOR UPDATE",
          [item.variantId],
        );
        if (!variant || Number(variant.stock) < Number(item.quantity)) {
          throw createHttpError(
            409,
            "Không thể xóa phiếu nhập vì số lượng tồn kho đã được sử dụng.",
          );
        }
        await connection.query(
          `
          UPDATE bienthesanpham
          SET SoLuongTon = SoLuongTon - ?,
              TrangThai = CASE WHEN SoLuongTon - ? = 0 THEN 'out_of_stock' ELSE TrangThai END
          WHERE MaBienThe = ?
        `,
          [item.quantity, item.quantity, item.variantId],
        );
        await connection.query(
          `
          UPDATE sanpham
          SET SoLuongTon = SoLuongTon - ?,
              TrangThai = CASE WHEN SoLuongTon - ? = 0 THEN 'out_of_stock' ELSE TrangThai END
          WHERE MaSanPham = ?
        `,
          [item.quantity, item.quantity, item.productId],
        );
      }
    }
    await connection.query(
      "DELETE FROM chitietphieunhap WHERE MaPhieuNhap = ?",
      [id],
    );
    await connection.query("DELETE FROM phieunhap WHERE MaPhieuNhap = ?", [id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listOrders() {
  const orders = await rows(`
    SELECT
      dh.MaDonHang AS id,
      nd.HoTen AS customer,
      dc.SoDienThoai AS phone,
      CONCAT_WS(', ', dc.DiaChiChiTiet, dc.PhuongXa, dc.QuanHuyen, dc.TinhThanh) AS address,
      dh.NgayTao AS createdAt,
      dh.TongTienHang AS subtotal,
      dh.SoTienGiam AS discount,
      dh.PhiVanChuyen AS shippingFee,
      dh.TongThanhToan AS total,
      dh.PhuongThucThanhToan AS paymentMethod,
      dh.TrangThaiThanhToan AS paymentStatus,
      dh.TrangThaiDonHang AS status
    FROM donhang dh
    INNER JOIN nguoidung nd ON nd.MaNguoiDung = dh.MaNguoiDung
    INNER JOIN diachi dc ON dc.MaDiaChi = dh.MaDiaChi
    ORDER BY dh.NgayTao DESC, dh.MaDonHang DESC
  `);
  const items = await rows(`
    SELECT
      ctdh.MaDonHang AS orderId,
      sp.TenSanPham AS name,
      ctdh.KichThuoc AS size,
      ctdh.MauSac AS color,
      ctdh.SoLuong AS quantity,
      ctdh.DonGia AS price
    FROM chitietdonhang ctdh
    INNER JOIN sanpham sp ON sp.MaSanPham = ctdh.MaSanPham
    ORDER BY ctdh.MaChiTietDonHang
  `);
  const itemsByOrder = new Map();
  for (const item of items) {
    const list = itemsByOrder.get(Number(item.orderId)) || [];
    list.push(item);
    itemsByOrder.set(Number(item.orderId), list);
  }

  return orders.map((order) => ({
    ...order,
    items: itemsByOrder.get(Number(order.id)) || [],
  }));
}

async function listVouchers() {
  return rows(`
    SELECT
      mgg.MaGiamGia AS id,
      mgg.MaCode AS code,
      mgg.TenMaGiamGia AS name,
      mgg.LoaiGiam AS discountType,
      mgg.GiaTriGiam AS discountValue,
      mgg.GiaTriDonHangToiThieu AS minOrderValue,
      mgg.MucGiamToiDa AS maxDiscount,
      mgg.SoLuong AS quantity,
      mgg.NgayBatDau AS startsAt,
      mgg.NgayKetThuc AS endsAt,
      mgg.TrangThai AS configuredStatus,
      CASE
        WHEN mgg.TrangThai = 'active' AND mgg.NgayKetThuc < NOW() THEN 'expired'
        WHEN mgg.TrangThai = 'active' AND mgg.NgayBatDau > NOW() THEN 'scheduled'
        WHEN mgg.TrangThai = 'active' AND mgg.SoLuong <= 0 THEN 'exhausted'
        ELSE mgg.TrangThai
      END AS status,
      mgg.NgayTao AS createdAt,
      COALESCE((
        SELECT COUNT(*)
        FROM nguoidungmagiamgia ndmgg
        WHERE ndmgg.MaGiamGia = mgg.MaGiamGia AND ndmgg.DaSuDung = TRUE
      ), 0) AS usedCount,
      COALESCE((
        SELECT COUNT(*)
        FROM donhang dh
        WHERE dh.MaGiamGia = mgg.MaGiamGia AND dh.TrangThaiDonHang <> 'cancelled'
      ), 0) AS orderCount,
      COALESCE((
        SELECT SUM(dh.SoTienGiam)
        FROM donhang dh
        WHERE dh.MaGiamGia = mgg.MaGiamGia AND dh.TrangThaiDonHang <> 'cancelled'
      ), 0) AS totalDiscount
    FROM magiamgia mgg
    ORDER BY mgg.NgayTao DESC, mgg.MaGiamGia DESC
  `);
}

async function createVoucher(voucher) {
  const result = await rows("INSERT INTO magiamgia SET ?", [voucher]);
  return result.insertId;
}

async function updateVoucher(id, voucher) {
  const result = await rows("UPDATE magiamgia SET ? WHERE MaGiamGia = ?", [
    voucher,
    id,
  ]);
  if (!result.affectedRows)
    throw createHttpError(404, "Khong tim thay ma giam gia.");
}

async function deleteVoucher(id) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[voucher]] = await connection.query(
      "SELECT MaGiamGia FROM magiamgia WHERE MaGiamGia = ? FOR UPDATE",
      [id],
    );
    if (!voucher) throw createHttpError(404, "Khong tim thay ma giam gia.");
    const [[{ orderTotal }]] = await connection.query(
      "SELECT COUNT(*) AS orderTotal FROM donhang WHERE MaGiamGia = ?", [id],
    );
    const [[{ userTotal }]] = await connection.query(
      "SELECT COUNT(*) AS userTotal FROM nguoidungmagiamgia WHERE MaGiamGia = ?", [id],
    );
    await connection.query(
      Number(orderTotal) > 0 || Number(userTotal) > 0
        ? "UPDATE magiamgia SET TrangThai = 'inactive' WHERE MaGiamGia = ?"
        : "DELETE FROM magiamgia WHERE MaGiamGia = ?",
      [id],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateOrderStatus(id, status) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[order]] = await connection.query(
      `SELECT TrangThaiDonHang AS status, TrangThaiThanhToan AS paymentStatus,
        PhuongThucThanhToan AS paymentMethod,
        MaGiamGia AS voucherId,
        MaNguoiDung AS userId
       FROM donhang WHERE MaDonHang = ? FOR UPDATE`,
      [id],
    );
    if (!order) throw createHttpError(404, "Không tìm thấy đơn hàng.");
    if (order.status === "cancelled" && status !== "cancelled") {
      throw createHttpError(409, "Đơn đã hủy không thể khôi phục trạng thái.");
    }
    if (order.status === "completed" && status !== "completed") {
      throw createHttpError(409, "Đơn đã hoàn thành không thể đổi trạng thái.");
    }
    if (status === "cancelled" && order.status !== "cancelled") {
      const [items] = await connection.query(
        `SELECT MaSanPham AS productId, MaBienThe AS variantId, SoLuong AS quantity
         FROM chitietdonhang WHERE MaDonHang = ?`,
        [id],
      );
      for (const item of items) {
        await connection.query(
          `
          UPDATE bienthesanpham
          SET SoLuongTon = SoLuongTon + ?,
              TrangThai = CASE WHEN TrangThai = 'out_of_stock' THEN 'active' ELSE TrangThai END
          WHERE MaBienThe = ?
        `,
          [item.quantity, item.variantId],
        );
        await connection.query(
          `
          UPDATE sanpham
          SET SoLuongTon = SoLuongTon + ?,
              TrangThai = CASE WHEN TrangThai = 'out_of_stock' THEN 'active' ELSE TrangThai END
          WHERE MaSanPham = ?
        `,
          [item.quantity, item.productId],
        );
      }
      if (order.voucherId) {
        await connection.query(
          "UPDATE magiamgia SET SoLuong = SoLuong + 1 WHERE MaGiamGia = ?",
          [order.voucherId],
        );
        await connection.query(
          `UPDATE nguoidungmagiamgia
           SET DaSuDung = FALSE,
               NgaySuDung = NULL
           WHERE MaGiamGia = ? AND MaNguoiDung = ?`,
          [order.voucherId, order.userId],
        );
      }
    }
    const paymentStatus =
      status === "cancelled" && order.paymentStatus === "paid"
        ? "refunded"
        : status === "completed" && order.paymentMethod === "COD"
          ? "paid"
          : order.paymentStatus;
    await connection.query(
      "UPDATE donhang SET TrangThaiDonHang = ?, TrangThaiThanhToan = ? WHERE MaDonHang = ?",
      [status, paymentStatus, id],
    );
    await connection.query(
      "UPDATE thanhtoan SET TrangThaiThanhToan = ? WHERE MaDonHang = ?",
      [paymentStatus, id],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteOrder(id) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[order]] = await connection.query(
      "SELECT TrangThaiDonHang AS status FROM donhang WHERE MaDonHang = ? FOR UPDATE",
      [id],
    );
    if (!order) throw createHttpError(404, "Không tìm thấy đơn hàng.");
    if (order.status !== "cancelled") {
      throw createHttpError(409, "Chỉ có thể xóa đơn hàng đã hủy.");
    }
    await connection.query("DELETE FROM danhgia WHERE MaDonHang = ?", [id]);
    await connection.query("DELETE FROM thanhtoan WHERE MaDonHang = ?", [id]);
    await connection.query("DELETE FROM chitietdonhang WHERE MaDonHang = ?", [
      id,
    ]);
    await connection.query("DELETE FROM donhang WHERE MaDonHang = ?", [id]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listCustomers() {
  return rows(`
    SELECT
      nd.MaNguoiDung AS id,
      nd.HoTen AS name,
      nd.SoDienThoai AS phone,
      nd.Email AS email,
      nd.NgayTao AS createdAt,
      nd.TrangThai AS status,
      COALESCE((
        SELECT CONCAT_WS(', ', dc.DiaChiChiTiet, dc.PhuongXa, dc.QuanHuyen, dc.TinhThanh)
        FROM diachi dc
        WHERE dc.MaNguoiDung = nd.MaNguoiDung
        ORDER BY dc.MacDinh DESC, dc.MaDiaChi DESC
        LIMIT 1
      ), '') AS address,
      COUNT(dh.MaDonHang) AS orderCount,
      COALESCE(SUM(CASE WHEN dh.TrangThaiDonHang = 'completed' THEN dh.TongThanhToan ELSE 0 END), 0) AS spent
    FROM nguoidung nd
    LEFT JOIN donhang dh ON dh.MaNguoiDung = nd.MaNguoiDung
    WHERE nd.VaiTro = 'user'
    GROUP BY nd.MaNguoiDung, nd.HoTen, nd.SoDienThoai, nd.Email,
      nd.NgayTao, nd.TrangThai
    ORDER BY nd.MaNguoiDung DESC
  `);
}

async function createUser(user) {
  const result = await rows("INSERT INTO nguoidung SET ?", [user]);
  return result.insertId;
}

async function updateUser(id, user) {
  const result = await rows("UPDATE nguoidung SET ? WHERE MaNguoiDung = ?", [
    user,
    id,
  ]);
  if (!result.affectedRows)
    throw createHttpError(404, "Không tìm thấy tài khoản.");
}

async function deleteUser(id) {
  const [{ total }] = await rows(
    "SELECT COUNT(*) AS total FROM donhang WHERE MaNguoiDung = ?",
    [id],
  );
  if (Number(total) > 0) {
    throw createHttpError(
      409,
      "Tài khoản đã có đơn hàng nên không thể xóa. Hãy khóa tài khoản thay thế.",
    );
  }
  const result = await rows("DELETE FROM nguoidung WHERE MaNguoiDung = ?", [
    id,
  ]);
  if (!result.affectedRows)
    throw createHttpError(404, "Không tìm thấy tài khoản.");
}

async function listAccounts() {
  return rows(`
    SELECT
      MaNguoiDung AS id,
      SUBSTRING_INDEX(Email, '@', 1) AS username,
      HoTen AS name,
      Email AS email,
      SoDienThoai AS phone,
      VaiTro AS role,
      TrangThai AS status,
      NgayTao AS createdAt
    FROM nguoidung
    ORDER BY MaNguoiDung DESC
  `);
}

module.exports = {
  createImport,
  createProduct,
  createProductType,
  createSupplier,
  createUser,
  createVoucher,
  deleteImport,
  deleteOrder,
  deleteProduct,
  deleteProductType,
  deleteSupplier,
  deleteUser,
  deleteVoucher,
  getDashboard,
  getStatistics,
  listAccounts,
  listCategories,
  listCustomers,
  listImports,
  listOrders,
  listProducts,
  listProductTypes,
  listSuppliers,
  listVouchers,
  receiveImport,
  updateOrderStatus,
  updateProduct,
  updateProductType,
  updateSupplier,
  updateUser,
  updateVoucher,
};
