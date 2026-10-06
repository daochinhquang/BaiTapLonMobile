function voucherError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function amount(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number < 1e13
    ? Math.round(number * 100) / 100
    : null;
}

function dateTime(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute, second = '00'] = match;
  const date = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second));
  if (+year < 1000 || date.toISOString().slice(0, 19) !== `${year}-${month}-${day}T${hour}:${minute}:${second}`) {
    return null;
  }
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function normalizeVoucher(body) {
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const discountValue = amount(body.discountValue);
  const minOrderValue = amount(body.minOrderValue ?? 0);
  const hasMaxDiscount = body.maxDiscount !== '' && body.maxDiscount != null;
  const maxDiscount = hasMaxDiscount ? amount(body.maxDiscount) : null;
  const quantity = body.quantity === '' || body.quantity == null ? NaN : Number(body.quantity);
  const startsAt = dateTime(body.startsAt);
  const endsAt = dateTime(body.endsAt);
  const status = body.status ?? 'active';

  if (!/^[A-Z0-9_-]{1,50}$/.test(code)) {
    throw voucherError('Ma voucher chi gom chu, so, dau gach ngang hoac gach duoi, toi da 50 ky tu.');
  }
  if (!name || name.length > 150 || !['phan_tram', 'tien_mat'].includes(body.discountType) ||
      discountValue === null || discountValue <= 0 || minOrderValue === null ||
      (hasMaxDiscount && maxDiscount === null) ||
      !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 2147483647 ||
      !startsAt || !endsAt || !['active', 'inactive', 'expired'].includes(status)) {
    throw voucherError('Vui long nhap day du va hop le thong tin voucher.');
  }
  if (body.discountType === 'phan_tram' && discountValue > 100) {
    throw voucherError('Voucher phan tram khong duoc vuot qua 100%.');
  }
  if (endsAt <= startsAt) {
    throw voucherError('Ngay ket thuc voucher phai sau ngay bat dau.');
  }

  return {
    MaCode: code,
    TenMaGiamGia: name,
    LoaiGiam: body.discountType,
    GiaTriGiam: discountValue,
    GiaTriDonHangToiThieu: minOrderValue,
    MucGiamToiDa: maxDiscount,
    SoLuong: quantity,
    NgayBatDau: startsAt,
    NgayKetThuc: endsAt,
    TrangThai: status,
  };
}

function calculateVoucherDiscount(voucher, subtotal) {
  const value = Number(voucher.GiaTriGiam || 0);
  const rawDiscount = voucher.LoaiGiam === 'phan_tram' ? subtotal * value / 100 : value;
  const cappedDiscount = voucher.MucGiamToiDa == null
    ? rawDiscount
    : Math.min(rawDiscount, Number(voucher.MucGiamToiDa));
  return Math.round(Math.min(subtotal, Math.max(0, cappedDiscount)) * 100) / 100;
}

module.exports = { calculateVoucherDiscount, normalizeVoucher };
