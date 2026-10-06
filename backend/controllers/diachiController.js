const Model = require('../models/diachiModel');
const UserModel = require('../models/nguoidungModel');

exports.getAll = (req, res) => Model.getAll((err, r) => err ? res.status(500).json(err) : res.json(r));
exports.getById = (req, res) => Model.getById(req.params.id, (err, r) => err ? res.status(500).json(err) : res.json(r[0]));
exports.create = (req, res) => Model.create(req.body, (err, r) => err ? res.status(500).json(err) : res.json({ id: r.insertId }));
exports.update = (req, res) => Model.update(req.params.id, req.body, (err) => err ? res.status(500).json(err) : res.json({ message: 'Updated' }));
exports.delete = (req, res) => Model.delete(req.params.id, (err) => err ? res.status(500).json(err) : res.json({ message: 'Deleted' }));

function pickAddressFields(body) {
  const address = {};

  if (typeof body.TenNguoiNhan === 'string') {
    address.TenNguoiNhan = body.TenNguoiNhan.trim();
  }

  if (typeof body.SoDienThoai === 'string') {
    address.SoDienThoai = body.SoDienThoai.trim();
  }

  if (typeof body.TinhThanh === 'string') {
    address.TinhThanh = body.TinhThanh.trim();
  }

  if (typeof body.QuanHuyen === 'string') {
    address.QuanHuyen = body.QuanHuyen.trim();
  }

  if (typeof body.PhuongXa === 'string') {
    address.PhuongXa = body.PhuongXa.trim();
  }

  if (typeof body.DiaChiChiTiet === 'string') {
    address.DiaChiChiTiet = body.DiaChiChiTiet.trim();
  }

  if (typeof body.MacDinh !== 'undefined') {
    address.MacDinh = Boolean(body.MacDinh);
  }

  return address;
}

function validateAddress(address) {
  return Boolean(
    address.TenNguoiNhan &&
      address.SoDienThoai &&
      address.TinhThanh &&
      address.QuanHuyen &&
      address.PhuongXa &&
      address.DiaChiChiTiet
  );
}

function withMobileUser(userId, res, cb) {
  return UserModel.getById(userId, (err, rows) => {
    if (err) {
      return res.status(500).json(err);
    }

    const user = rows && rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    }

    if (user.VaiTro !== 'user') {
      return res.status(403).json({
        message: 'Không được thao tác địa chỉ của tài khoản admin trên app mobile.',
      });
    }

    return cb();
  });
}

exports.getByUserId = (req, res) =>
  withMobileUser(req.params.userId, res, () =>
    Model.getByUserId(req.params.userId, (err, rows) => (err ? res.status(500).json(err) : res.json(rows)))
  );

exports.createForUser = (req, res) => {
  const userId = req.params.userId;
  const address = pickAddressFields(req.body || {});

  if (!validateAddress(address)) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin địa chỉ.' });
  }

  return withMobileUser(userId, res, () =>
    Model.getByUserId(userId, (findErr, rows) => {
      if (findErr) {
        return res.status(500).json(findErr);
      }

      const shouldBeDefault = Boolean(address.MacDinh) || rows.length === 0;
      const payload = {
        ...address,
        MaNguoiDung: Number(userId),
        MacDinh: shouldBeDefault,
      };

      const insertAddress = () =>
        Model.create(payload, (createErr) => {
          if (createErr) {
            return res.status(500).json(createErr);
          }

          return Model.getByUserId(userId, (reloadErr, updatedRows) =>
            reloadErr ? res.status(500).json(reloadErr) : res.status(201).json(updatedRows)
          );
        });

      if (!shouldBeDefault) {
        return insertAddress();
      }

      return Model.clearDefaultByUserId(userId, (clearErr) =>
        clearErr ? res.status(500).json(clearErr) : insertAddress()
      );
    })
  );
};

exports.setDefaultForUser = (req, res) => {
  const { addressId, userId } = req.params;

  return withMobileUser(userId, res, () =>
    Model.getById(addressId, (findErr, rows) => {
      if (findErr) {
        return res.status(500).json(findErr);
      }

      const address = rows && rows[0];

      if (!address || String(address.MaNguoiDung) !== String(userId)) {
        return res.status(404).json({ message: 'Không tìm thấy địa chỉ của tài khoản này.' });
      }

      return Model.clearDefaultByUserId(userId, (clearErr) => {
        if (clearErr) {
          return res.status(500).json(clearErr);
        }

        return Model.updateByUserId(addressId, userId, { MacDinh: true }, (updateErr) => {
          if (updateErr) {
            return res.status(500).json(updateErr);
          }

          return Model.getByUserId(userId, (reloadErr, updatedRows) =>
            reloadErr ? res.status(500).json(reloadErr) : res.json(updatedRows)
          );
        });
      });
    })
  );
};

exports.updateForUser = (req, res) => {
  const { addressId, userId } = req.params;
  const address = pickAddressFields(req.body || {});

  if (!validateAddress(address)) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin địa chỉ.' });
  }

  return withMobileUser(userId, res, () =>
    Model.getById(addressId, (findErr, rows) => {
      if (findErr) {
        return res.status(500).json(findErr);
      }

      const existedAddress = rows && rows[0];

      if (!existedAddress || String(existedAddress.MaNguoiDung) !== String(userId)) {
        return res.status(404).json({ message: 'Không tìm thấy địa chỉ của tài khoản này.' });
      }

      const updateAddress = () =>
        Model.updateByUserId(addressId, userId, address, (updateErr) => {
          if (updateErr) {
            return res.status(500).json(updateErr);
          }

          return Model.getByUserId(userId, (reloadErr, updatedRows) =>
            reloadErr ? res.status(500).json(reloadErr) : res.json(updatedRows)
          );
        });

      if (!address.MacDinh) {
        return updateAddress();
      }

      return Model.clearDefaultByUserId(userId, (clearErr) =>
        clearErr ? res.status(500).json(clearErr) : updateAddress()
      );
    })
  );
};

exports.deleteForUser = (req, res) => {
  const { addressId, userId } = req.params;

  return withMobileUser(userId, res, () =>
    Model.getById(addressId, (findErr, rows) => {
      if (findErr) {
        return res.status(500).json(findErr);
      }

      const existedAddress = rows && rows[0];

      if (!existedAddress || String(existedAddress.MaNguoiDung) !== String(userId)) {
        return res.status(404).json({ message: 'Không tìm thấy địa chỉ của tài khoản này.' });
      }

      return Model.deleteByUserId(addressId, userId, (deleteErr) => {
        if (deleteErr) {
          if (deleteErr.code === 'ER_ROW_IS_REFERENCED_2' || deleteErr.code === 'ER_ROW_IS_REFERENCED') {
            return res.status(409).json({
              message: 'Địa chỉ này đã được dùng trong đơn hàng nên không thể xóa.',
            });
          }

          return res.status(500).json(deleteErr);
        }

        const reloadAddresses = () =>
          Model.getByUserId(userId, (reloadErr, updatedRows) =>
            reloadErr ? res.status(500).json(reloadErr) : res.json(updatedRows)
          );

        if (!existedAddress.MacDinh) {
          return reloadAddresses();
        }

        return Model.setLatestDefaultByUserId(userId, (defaultErr) =>
          defaultErr ? res.status(500).json(defaultErr) : reloadAddresses()
        );
      });
    })
  );
};
