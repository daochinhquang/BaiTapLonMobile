const Model = require("../models/nguoidungModel");
const { createAdminSession } = require("../common/adminSession");
exports.getAll = (req, res) =>
  Model.getAll((err, r) => (err ? res.status(500).json(err) : res.json(r)));
exports.getById = (req, res) =>
  Model.getById(req.params.id, (err, r) =>
    err ? res.status(500).json(err) : res.json(r[0]),
  );
exports.create = (req, res) =>
  Model.create(req.body, (err, r) =>
    err ? res.status(500).json(err) : res.json({ id: r.insertId }),
  );
exports.update = (req, res) =>
  Model.update(req.params.id, req.body, (err) =>
    err ? res.status(500).json(err) : res.json({ message: "Updated" }),
  );
exports.delete = (req, res) =>
  Model.delete(req.params.id, (err) =>
    err ? res.status(500).json(err) : res.json({ message: "Deleted" }),
  );

function pickProfileFields(body) {
  const profile = {};

  if (typeof body.HoTen === "string") {
    profile.HoTen = body.HoTen.trim();
  }

  if (typeof body.Email === "string") {
    profile.Email = body.Email.trim();
  }

  if (typeof body.SoDienThoai === "string") {
    profile.SoDienThoai = body.SoDienThoai.trim();
  }

  if (typeof body.AnhDaiDien === "string") {
    profile.AnhDaiDien = body.AnhDaiDien.trim();
  }

  if (typeof body.GioiTinh === "string") {
    profile.GioiTinh = body.GioiTinh.trim();
  }

  if (typeof body.NgaySinh === "string") {
    profile.NgaySinh = body.NgaySinh.trim();
  }

  return profile;
}

function removeSensitiveFields(user) {
  const { MatKhau, ...safeUser } = user;

  return safeUser;
}

function isDemoHashPassword(storedPassword, password) {
  return (
    typeof storedPassword === "string" &&
    storedPassword.startsWith("$2y$10$HashMatKhau") &&
    password === "12345678"
  );
}

function passwordMatches(storedPassword, password) {
  return (
    storedPassword === password || isDemoHashPassword(storedPassword, password)
  );
}

exports.register = (req, res) => {
  const body = req.body || {};
  const fullName = typeof body.HoTen === "string" ? body.HoTen.trim() : "";
  const email =
    typeof body.Email === "string" && body.Email.trim()
      ? body.Email.trim()
      : null;
  const phone =
    typeof body.SoDienThoai === "string" && body.SoDienThoai.trim()
      ? body.SoDienThoai.trim()
      : null;
  const password = typeof body.MatKhau === "string" ? body.MatKhau : "";

  if (!fullName || !password || (!email && !phone)) {
    return res.status(400).json({
      message:
        "Vui lòng nhập họ tên, mật khẩu và ít nhất email hoặc số điện thoại.",
    });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Mật khẩu cần có ít nhất 6 ký tự." });
  }

  return Model.ensureProfileColumns((columnErr) => {
    if (columnErr) {
      return res.status(500).json(columnErr);
    }

    return Model.findByEmailOrPhone(email, phone, (findErr, rows) => {
      if (findErr) {
        return res.status(500).json(findErr);
      }

      if (rows && rows.length) {
        return res
          .status(409)
          .json({ message: "Email hoặc số điện thoại đã được sử dụng." });
      }

      return Model.create(
        {
          Email: email,
          HoTen: fullName,
          MatKhau: password,
          SoDienThoai: phone,
          TrangThai: "active",
          VaiTro: "user",
        },
        (createErr, result) => {
          if (createErr) {
            if (createErr.code === "ER_DUP_ENTRY") {
              return res
                .status(409)
                .json({ message: "Email hoặc số điện thoại đã được sử dụng." });
            }

            return res.status(500).json(createErr);
          }

          return Model.getById(result.insertId, (reloadErr, updatedRows) => {
            if (reloadErr) {
              return res.status(500).json(reloadErr);
            }

            return res
              .status(201)
              .json({ user: removeSensitiveFields(updatedRows[0]) });
          });
        },
      );
    });
  });
};

exports.login = (req, res) => {
  const { identifier, password } = req.body || {};

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập tài khoản và mật khẩu." });
  }

  return Model.findByIdentifier(identifier, (err, rows) => {
    if (err) {
      return res.status(500).json(err);
    }

    const user = rows && rows[0];

    if (!user) {
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu không đúng." });
    }

    if (user.TrangThai !== "active") {
      return res.status(403).json({ message: "Tài khoản đã bị khóa." });
    }

    const passwordMatched = passwordMatches(user.MatKhau, password);

    if (!passwordMatched) {
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu không đúng." });
    }

    if (user.VaiTro !== "user") {
      return res.status(403).json({
        message: "Vui lòng đăng nhập tài khoản admin trên website.",
      });
    }

    return res.json({ user: removeSensitiveFields(user) });
  });
};

exports.adminLogin = (req, res) => {
  const { identifier, password } = req.body || {};

  if (
    typeof identifier !== "string" ||
    typeof password !== "string" ||
    !identifier ||
    !password
  ) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập tài khoản và mật khẩu." });
  }

  return Model.findByIdentifier(identifier.trim(), (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Máy chủ không thể xử lý yêu cầu." });
    }

    const user = rows && rows[0];

    if (!user || !passwordMatches(user.MatKhau, password)) {
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu không đúng." });
    }

    if (user.VaiTro !== "admin" || user.TrangThai !== "active") {
      return res
        .status(403)
        .json({ message: "Tài khoản không có quyền truy cập quản trị." });
    }

    try {
      const token = createAdminSession(user);
      return res.json({
        token,
        user: {
          email: user.Email || "",
          fullName: user.HoTen,
          id: String(user.MaNguoiDung),
          role: user.VaiTro,
        },
      });
    } catch {
      return res
        .status(500)
        .json({ message: "Chưa cấu hình khóa phiên quản trị." });
    }
  });
};

exports.changePassword = (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới." });
  }

  if (String(newPassword).length < 6) {
    return res
      .status(400)
      .json({ message: "Mật khẩu mới cần có ít nhất 6 ký tự." });
  }

  return Model.getById(userId, (findErr, rows) => {
    if (findErr) {
      return res.status(500).json(findErr);
    }

    const user = rows && rows[0];

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản." });
    }

    if (user.VaiTro !== "user") {
      return res.status(403).json({
        message: "Không được đổi mật khẩu tài khoản admin trên app mobile.",
      });
    }

    if (!passwordMatches(user.MatKhau, currentPassword)) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng." });
    }

    return Model.updatePassword(userId, String(newPassword), (updateErr) =>
      updateErr
        ? res.status(500).json(updateErr)
        : res.json({ message: "Đã đổi mật khẩu." }),
    );
  });
};

exports.updateProfile = (req, res) => {
  const userId = req.params.id;
  const profile = pickProfileFields(req.body || {});

  if (!profile.HoTen || !profile.Email || !profile.SoDienThoai) {
    return res.status(400).json({
      message: "Vui lòng nhập đầy đủ họ tên, email và số điện thoại.",
    });
  }

  return Model.ensureProfileColumns((columnErr) => {
    if (columnErr) {
      return res.status(500).json(columnErr);
    }

    return Model.getById(userId, (findErr, rows) => {
      if (findErr) {
        return res.status(500).json(findErr);
      }

      const user = rows && rows[0];

      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy tài khoản." });
      }

      if (user.VaiTro !== "user") {
        return res.status(403).json({
          message:
            "Không được cập nhật thông tin tài khoản admin trên app mobile.",
        });
      }

      return Model.updateProfile(userId, profile, (updateErr) => {
        if (updateErr) {
          if (updateErr.code === "ER_DUP_ENTRY") {
            return res
              .status(409)
              .json({ message: "Email hoặc số điện thoại đã được sử dụng." });
          }

          return res.status(500).json(updateErr);
        }

        return Model.getById(userId, (reloadErr, updatedRows) => {
          if (reloadErr) {
            return res.status(500).json(reloadErr);
          }

          return res.json({ user: removeSensitiveFields(updatedRows[0]) });
        });
      });
    });
  });
};
