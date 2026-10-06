const Model = require('../models/giohangModel');

exports.getAll = (req, res) => Model.getAll((err, r) => err ? res.status(500).json(err) : res.json(r));
exports.getById = (req, res) => Model.getById(req.params.id, (err, r) => err ? res.status(500).json(err) : res.json(r[0]));
exports.create = (req, res) => Model.create(req.body, (err, r) => err ? res.status(500).json(err) : res.json({ id: r.insertId }));
exports.update = (req, res) => Model.update(req.params.id, req.body, (err) => err ? res.status(500).json(err) : res.json({ message: 'Updated' }));
exports.delete = (req, res) => Model.delete(req.params.id, (err) => err ? res.status(500).json(err) : res.json({ message: 'Deleted' }));

function asPositiveQuantity(value, fallback = 1) {
  const quantity = Number(value ?? fallback);

  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : fallback;
}

function withCart(userId, res, cb) {
  return Model.getOrCreateByUserId(userId, (cartErr, rows) => {
    if (cartErr) {
      return res.status(500).json(cartErr);
    }

    const cart = rows && rows[0];

    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng.' });
    }

    return cb(cart);
  });
}

function reloadCart(userId, res, statusCode = 200) {
  return Model.getItemsByUserId(userId, (reloadErr, rows) =>
    reloadErr ? res.status(500).json(reloadErr) : res.status(statusCode).json(rows)
  );
}

function ensureVariantStock(productId, variantId, quantity, res, cb) {
  return Model.getVariant(productId, variantId, (variantErr, rows) => {
    if (variantErr) {
      return res.status(500).json(variantErr);
    }

    const variant = rows && rows[0];

    if (!variant || variant.TrangThaiSanPham === 'inactive') {
      return res.status(404).json({ message: 'Không tìm thấy biến thể sản phẩm.' });
    }

    if (Number(variant.SoLuongTon) < quantity) {
      return res.status(400).json({ message: `Biến thể của ${variant.TenSanPham} chỉ còn ${variant.SoLuongTon}.` });
    }

    return cb(variant);
  });
}

exports.getByUserId = (req, res) => reloadCart(req.params.userId, res);

exports.addItemForUser = (req, res) => {
  const { userId } = req.params;
  const productId = req.body?.MaSanPham;
  const variantId = req.body?.MaBienThe;
  const quantity = asPositiveQuantity(req.body?.SoLuong);

  if (!productId) {
    return res.status(400).json({ message: 'Vui lòng chọn sản phẩm.' });
  }

  return ensureVariantStock(productId, variantId, quantity, res, (variant) =>
    withCart(userId, res, (cart) => Model.getItem(cart.MaGioHang, variant.MaBienThe, (itemErr, rows) => {
      if (itemErr) return res.status(500).json(itemErr);
      const nextQuantity = Number(rows?.[0]?.SoLuong || 0) + quantity;
      if (nextQuantity > Number(variant.SoLuongTon)) {
        return res.status(400).json({ message: `Biến thể của ${variant.TenSanPham} chỉ còn ${variant.SoLuongTon}.` });
      }
      return Model.addItem(cart.MaGioHang, productId, variant.MaBienThe, quantity, (addErr) =>
        addErr ? res.status(500).json(addErr) : reloadCart(userId, res, 201)
      );
    }))
  );
};

exports.updateItemForUser = (req, res) => {
  const { productId, userId, variantId } = req.params;
  const quantity = asPositiveQuantity(req.body?.SoLuong);

  return ensureVariantStock(productId, variantId, quantity, res, (variant) =>
    withCart(userId, res, (cart) =>
      Model.updateItemQuantity(cart.MaGioHang, variant.MaBienThe, quantity, (updateErr) =>
        updateErr ? res.status(500).json(updateErr) : reloadCart(userId, res)
      )
    )
  );
};

exports.deleteItemForUser = (req, res) => {
  const { productId, userId, variantId } = req.params;

  if (variantId) {
    return withCart(userId, res, (cart) =>
      Model.deleteItem(cart.MaGioHang, variantId, (deleteErr) =>
        deleteErr ? res.status(500).json(deleteErr) : reloadCart(userId, res)
      )
    );
  }

  return ensureVariantStock(productId, null, 0, res, (variant) =>
    withCart(userId, res, (cart) =>
      Model.deleteItem(cart.MaGioHang, variant.MaBienThe, (deleteErr) =>
        deleteErr ? res.status(500).json(deleteErr) : reloadCart(userId, res)
      )
    )
  );
};
