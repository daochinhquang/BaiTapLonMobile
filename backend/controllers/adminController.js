const Model = require("../models/adminModel");
const { normalizeVoucher } = require("../common/voucher");
const { normalizeProductImage } = require("../common/productImage");
const { normalizeProductTypeCode } = require("../common/productTypeCode");
const {
  normalizeProductVariants,
  summarizeProductVariants,
} = require("../common/productVariant");

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function positiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function nonNegativeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function sendError(res, error) {
  if (error?.status) {
    return res.status(error.status).json({ message: error.message });
  }
  if (error?.code === "ER_DUP_ENTRY") {
    return res
      .status(409)
      .json({ message: "Dữ liệu đã tồn tại trong hệ thống." });
  }
  if (error?.code === "ER_ROW_IS_REFERENCED_2") {
    return res
      .status(409)
      .json({ message: "Không thể xóa dữ liệu đang được sử dụng." });
  }
  console.error(error);
  return res.status(500).json({ message: "Máy chủ không thể xử lý yêu cầu." });
}

function handler(action) {
  return async (req, res) => {
    try {
      const result = await action(req, res);
      if (!res.headersSent) res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  };
}

function productPayload(body) {
  const name = text(body.name);
  const typeId = positiveInteger(body.typeId);
  const supplierId = positiveInteger(body.supplierId);
  const fallbackPrice = nonNegativeNumber(body.price);
  const fallbackStock = nonNegativeNumber(body.stock);
  if (
    !name ||
    !typeId ||
    !supplierId ||
    fallbackPrice === null ||
    fallbackStock === null
  ) {
    const error = new Error(
      "Vui lòng nhập đầy đủ tên, loại, nhà cung cấp và biến thể sản phẩm.",
    );
    error.status = 400;
    throw error;
  }
  const variants = normalizeProductVariants(body.variants, {
    price: fallbackPrice,
    stock: fallbackStock,
  });
  const { price, stock } = summarizeProductVariants(variants);
  const requestedStatus = ["active", "inactive", "out_of_stock"].includes(
    body.status,
  )
    ? body.status
    : "active";

  return {
    AnhDaiDien: normalizeProductImage(body.image),
    GiaBan: price,
    MaLoaiSanPham: typeId,
    MaNhaCungCap: supplierId,
    MoTa: text(body.description) || null,
    SoLuongTon: stock,
    TenSanPham: name,
    ThuongHieu: text(body.brand) || null,
    TrangThai:
      requestedStatus === "inactive"
        ? "inactive"
        : stock === 0
          ? "out_of_stock"
          : "active",
    variants,
  };
}

function productTypePayload(body) {
  const name = text(body.name);
  const categoryId = positiveInteger(body.categoryId);
  if (!name || !categoryId) {
    const error = new Error("Vui lòng nhập tên loại sản phẩm và danh mục.");
    error.status = 400;
    throw error;
  }
  return {
    MaDanhMuc: categoryId,
    MoTa: text(body.description) || null,
    TenLoaiSanPham: name,
    TrangThai: body.status === "inactive" ? "inactive" : "active",
  };
}

function supplierPayload(body) {
  const name = text(body.name);
  const phone = text(body.phone);
  if (!name || !phone) {
    const error = new Error("Vui lòng nhập tên và số điện thoại nhà cung cấp.");
    error.status = 400;
    throw error;
  }
  return {
    DiaChi: text(body.address) || null,
    Email: text(body.email) || null,
    MaSoThue: text(body.taxCode) || null,
    NguoiLienHe: text(body.contact) || null,
    SoDienThoai: phone,
    TenNhaCungCap: name,
    TrangThai: body.status === "inactive" ? "inactive" : "active",
  };
}

function userPayload(body, defaultRole = "user", requirePassword = false) {
  const name = text(body.name);
  const email = text(body.email);
  const phone = text(body.phone) || null;
  const password = text(body.password);
  if (!name || !email || (requirePassword && password.length < 6)) {
    const error = new Error(
      requirePassword
        ? "Vui lòng nhập họ tên, email và mật khẩu ít nhất 6 ký tự."
        : "Vui lòng nhập họ tên và email.",
    );
    error.status = 400;
    throw error;
  }
  const payload = {
    Email: email,
    HoTen: name,
    SoDienThoai: phone,
    TrangThai: body.status === "locked" ? "locked" : "active",
    VaiTro: body.role === "admin" ? "admin" : defaultRole,
  };
  if (requirePassword || password) payload.MatKhau = password;
  return payload;
}

exports.dashboard = handler(() => Model.getDashboard());
exports.statistics = handler(() => Model.getStatistics());

exports.getProducts = handler(() => Model.listProducts());
exports.createProduct = handler(async (req, res) => {
  const id = await Model.createProduct(productPayload(req.body || {}));
  res.status(201);
  return { id };
});
exports.updateProduct = handler(async (req) => {
  await Model.updateProduct(req.params.id, productPayload(req.body || {}));
  return { message: "Đã cập nhật sản phẩm." };
});
exports.deleteProduct = handler(async (req) => {
  await Model.deleteProduct(req.params.id);
  return { message: "Đã xóa sản phẩm." };
});

exports.getProductTypes = handler(() => Model.listProductTypes());
exports.getCategories = handler(() => Model.listCategories());
exports.createProductType = handler(async (req, res) => {
  const code =
    req.body?.code === undefined
      ? null
      : normalizeProductTypeCode(req.body.code);
  const id = await Model.createProductType(
    productTypePayload(req.body || {}),
    code,
  );
  res.status(201);
  return { id };
});
exports.updateProductType = handler(async (req) => {
  const currentId = normalizeProductTypeCode(req.params.id);
  const nextId =
    req.body?.code === undefined
      ? currentId
      : normalizeProductTypeCode(req.body.code);
  await Model.updateProductType(
    currentId,
    nextId,
    productTypePayload(req.body || {}),
  );
  return { message: "Đã cập nhật loại sản phẩm." };
});
exports.deleteProductType = handler(async (req) => {
  await Model.deleteProductType(req.params.id);
  return { message: "Đã xóa loại sản phẩm." };
});

exports.getSuppliers = handler(() => Model.listSuppliers());
exports.createSupplier = handler(async (req, res) => {
  const id = await Model.createSupplier(supplierPayload(req.body || {}));
  res.status(201);
  return { id };
});
exports.updateSupplier = handler(async (req) => {
  await Model.updateSupplier(req.params.id, supplierPayload(req.body || {}));
  return { message: "Đã cập nhật nhà cung cấp." };
});
exports.deleteSupplier = handler(async (req) => {
  await Model.deleteSupplier(req.params.id);
  return { message: "Đã xóa nhà cung cấp." };
});

exports.getVouchers = handler(() => Model.listVouchers());
exports.createVoucher = handler(async (req, res) => {
  const id = await Model.createVoucher(normalizeVoucher(req.body || {}));
  res.status(201);
  return { id };
});
exports.updateVoucher = handler(async (req) => {
  await Model.updateVoucher(req.params.id, normalizeVoucher(req.body || {}));
  return { message: "Da cap nhat voucher." };
});
exports.deleteVoucher = handler(async (req) => {
  await Model.deleteVoucher(req.params.id);
  return { message: "Da xoa hoac tam ngung voucher." };
});

exports.getImports = handler(() => Model.listImports());
exports.createImport = handler(async (req, res) => {
  const supplierId = positiveInteger(req.body?.supplierId);
  const productId = positiveInteger(req.body?.productId);
  const variantId = positiveInteger(req.body?.variantId);
  const quantity = positiveInteger(req.body?.quantity);
  const unitPrice = nonNegativeNumber(req.body?.unitPrice);
  const importedAt = text(req.body?.importedAt);
  if (
    !supplierId ||
    !productId ||
    !variantId ||
    !quantity ||
    unitPrice === null ||
    !importedAt
  ) {
    const error = new Error(
      "Vui lòng nhập đầy đủ nhà cung cấp, sản phẩm, biến thể, ngày, số lượng và giá nhập.",
    );
    error.status = 400;
    throw error;
  }
  const id = await Model.createImport({
    importedAt,
    note: text(req.body?.note),
    productId,
    variantId,
    quantity,
    status: req.body?.status === "completed" ? "completed" : "draft",
    supplierId,
    unitPrice,
  });
  res.status(201);
  return { id };
});
exports.receiveImport = handler(async (req) => {
  await Model.receiveImport(req.params.id);
  return { message: "Đã xác nhận nhập kho." };
});
exports.deleteImport = handler(async (req) => {
  await Model.deleteImport(req.params.id);
  return { message: "Đã xóa phiếu nhập." };
});

exports.getOrders = handler(() => Model.listOrders());
exports.updateOrderStatus = handler(async (req) => {
  const status = req.body?.status;
  if (
    !["pending", "confirmed", "shipping", "completed", "cancelled"].includes(
      status,
    )
  ) {
    const error = new Error("Trạng thái đơn hàng không hợp lệ.");
    error.status = 400;
    throw error;
  }
  await Model.updateOrderStatus(req.params.id, status);
  return { message: "Đã cập nhật trạng thái đơn hàng." };
});
exports.deleteOrder = handler(async (req) => {
  await Model.deleteOrder(req.params.id);
  return { message: "Đã xóa đơn hàng." };
});

exports.getCustomers = handler(() => Model.listCustomers());
exports.createCustomer = handler(async (req, res) => {
  const id = await Model.createUser(userPayload(req.body || {}, "user", true));
  res.status(201);
  return { id };
});
exports.updateCustomer = handler(async (req) => {
  await Model.updateUser(req.params.id, userPayload(req.body || {}, "user"));
  return { message: "Đã cập nhật khách hàng." };
});
exports.deleteCustomer = handler(async (req) => {
  await Model.deleteUser(req.params.id);
  return { message: "Đã xóa khách hàng." };
});

exports.getAccounts = handler(() => Model.listAccounts());
exports.createAccount = handler(async (req, res) => {
  const id = await Model.createUser(userPayload(req.body || {}, "user", true));
  res.status(201);
  return { id };
});
exports.updateAccount = handler(async (req) => {
  await Model.updateUser(req.params.id, userPayload(req.body || {}, "user"));
  return { message: "Đã cập nhật tài khoản." };
});
exports.deleteAccount = handler(async (req) => {
  await Model.deleteUser(req.params.id);
  return { message: "Đã xóa tài khoản." };
});
