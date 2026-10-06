const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createAdminSession,
  verifyAdminSession,
} = require("../common/adminSession");

test("admin sessions are signed and expire after eight hours", () => {
  const now = Date.UTC(2026, 0, 1);
  const token = createAdminSession(
    { HoTen: "Quản trị viên", MaNguoiDung: 7 },
    now,
  );

  assert.equal(verifyAdminSession(token, now).id, "7");
  assert.equal(verifyAdminSession(token, now + 8 * 60 * 60 * 1000), null);
});

test("admin sessions reject tampered tokens", () => {
  const token = createAdminSession({ HoTen: "Admin", MaNguoiDung: 7 });
  const tamperedToken = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

  assert.equal(verifyAdminSession(tamperedToken), null);
});
