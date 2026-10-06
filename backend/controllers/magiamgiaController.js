const Model = require('../models/magiamgiaModel');
const adminController = require('./adminController');

function optionalUserId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function adminVoucherRequest(req) {
  const body = req.body || {};
  req.body = {
    code: body.code ?? body.MaCode,
    name: body.name ?? body.TenMaGiamGia,
    discountType: body.discountType ?? body.LoaiGiam,
    discountValue: body.discountValue ?? body.GiaTriGiam,
    minOrderValue: body.minOrderValue ?? body.GiaTriDonHangToiThieu,
    maxDiscount: body.maxDiscount ?? body.MucGiamToiDa,
    quantity: body.quantity ?? body.SoLuong,
    startsAt: body.startsAt ?? body.NgayBatDau,
    endsAt: body.endsAt ?? body.NgayKetThuc,
    status: body.status ?? body.TrangThai,
  };
  return req;
}
exports.getAll = (req, res) => Model.getAll((err, r) => err ? res.status(500).json(err) : res.json(r));
exports.getAvailable = (req, res) => Model.getAvailable(optionalUserId(req.query.userId), (err, r) => err ? res.status(500).json({ message: 'Khong the tai danh sach voucher.' }) : res.json(r));
exports.getById = (req, res) => Model.getById(req.params.id, (err, r) => err ? res.status(500).json(err) : res.json(r[0]));
exports.validate = (req, res) => {
  const code = String(req.body?.MaCode || req.body?.code || '').trim();
  const rawSubtotal = req.body?.TongTienHang ?? req.body?.subtotal;
  const subtotal = Number(rawSubtotal);
  const userId = optionalUserId(req.body?.MaNguoiDung ?? req.body?.userId);

  if (!/^[A-Z0-9_-]{1,50}$/i.test(code) || rawSubtotal == null || rawSubtotal === '' || !Number.isFinite(subtotal) || subtotal < 0) {
    return res.status(400).json({ message: 'Vui long nhap ma giam gia va tong tien hang hop le.' });
  }

  return Model.validate({ code, subtotal, userId }, (err, r) =>
    err ? res.status(err.status || 500).json({ message: err.message }) : res.json(r)
  );
};
exports.create = (req, res) => adminController.createVoucher(adminVoucherRequest(req), res);
exports.update = (req, res) => adminController.updateVoucher(adminVoucherRequest(req), res);
exports.delete = adminController.deleteVoucher;
