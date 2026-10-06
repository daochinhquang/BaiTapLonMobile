const Model = require('../models/donhangModel');
exports.getAll = (req, res) => Model.getAll((err, r) => err ? res.status(500).json(err) : res.json(r));
exports.getById = (req, res) =>
  Model.getById(req.params.id, (err, r) => {
    if (err) {
      return res.status(err.status || 500).json({ message: err.message, ...err });
    }

    if (!r) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    return res.json(r);
  });
exports.create = (req, res) => Model.create(req.body, (err, r) => err ? res.status(500).json(err) : res.json({ id: r.insertId }));
exports.update = (req, res) => Model.update(req.params.id, req.body, (err) => err ? res.status(500).json(err) : res.json({ message: 'Updated' }));
exports.delete = (req, res) => Model.delete(req.params.id, (err) => err ? res.status(500).json(err) : res.json({ message: 'Deleted' }));

function normalizeItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  const quantities = new Map();
  for (const item of items) {
    const productId = Number(item?.MaSanPham);
    const variantId = Number(item?.MaBienThe);
    const quantity = Number(item?.SoLuong);
    if (
      !Number.isSafeInteger(productId) || productId <= 0 ||
      !Number.isSafeInteger(variantId) || variantId <= 0 ||
      !Number.isSafeInteger(quantity) || quantity <= 0
    ) {
      return [];
    }
    const current = quantities.get(variantId);
    if (current && current.MaSanPham !== productId) return [];
    const total = (current?.SoLuong || 0) + quantity;
    if (!Number.isSafeInteger(total)) return [];
    quantities.set(variantId, { MaBienThe: variantId, MaSanPham: productId, SoLuong: total });
  }
  return Array.from(quantities.values());
}

exports.getByUserId = (req, res) =>
  Model.getByUserId(req.params.userId, (err, rows) =>
    err ? res.status(500).json(err) : res.json(rows)
  );

exports.getDetailForUser = (req, res) =>
  Model.getDetailForUser(req.params.userId, req.params.orderId, (err, order) => {
    if (err) {
      return res.status(err.status || 500).json({ message: err.message, ...err });
    }

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng của tài khoản này.' });
    }

    return res.json(order);
  });

exports.checkout = (req, res) => {
  const body = req.body || {};
  const items = normalizeItems(body.items);
  const paymentMethod = body.PhuongThucThanhToan || 'COD';
  const voucherCode = body.MaCode || body.voucherCode;

  if ((body.MaGiamGia != null && (!Number.isSafeInteger(Number(body.MaGiamGia)) || Number(body.MaGiamGia) <= 0)) ||
      (voucherCode != null && (typeof voucherCode !== 'string' || !/^[A-Z0-9_-]{1,50}$/i.test(voucherCode.trim())))) {
    return res.status(400).json({ message: 'Mã giảm giá không hợp lệ.' });
  }

  if (!body.MaNguoiDung || !body.MaDiaChi || items.length === 0) {
    return res.status(400).json({ message: 'Vui lòng chọn địa chỉ và ít nhất một sản phẩm.' });
  }

  if (paymentMethod !== 'COD') {
    return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ.' });
  }

  return Model.createCheckout(
    {
      addressId: body.MaDiaChi,
      clearCart: body.clearCart === true,
      items,
      note: body.GhiChu,
      paymentMethod,
      userId: body.MaNguoiDung,
      voucherCode,
      voucherId: body.MaGiamGia,
    },
    (err, order) => {
      if (err) {
        return res.status(err.status || 500).json({ message: err.message, ...err });
      }

      return res.status(201).json(order);
    }
  );
};

exports.cancelForUser = (req, res) =>
  Model.cancelForUser(req.params.userId, req.params.orderId, (err, order) => {
    if (err) {
      return res.status(err.status || 500).json({ message: err.message, ...err });
    }

    return res.json(order);
  });
