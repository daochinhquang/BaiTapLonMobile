const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

function loadAdminModel(connection) {
  const database = { getConnection: async () => connection };
  const pool = { promise: () => database };
  const module = { exports: {} };
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, "../models/adminModel.js"), "utf8"),
    {
      exports: module.exports,
      module,
      require: (name) => (name === "../common/db" ? pool : require(name)),
    },
  );
  return module.exports;
}

test("receiving a draft import adds variant and product stock only once", async () => {
  let status = "draft";
  const stockUpdates = [];
  const connection = {
    async beginTransaction() {},
    async commit() {},
    async rollback() {},
    release() {},
    async query(sql) {
      if (sql.includes("SELECT TrangThai AS status FROM phieunhap")) {
        return [[{ status }], []];
      }
      if (sql.includes("FROM chitietphieunhap")) {
        return [[{ productId: 8, variantId: 21, quantity: 3 }], []];
      }
      if (
        sql.includes("UPDATE bienthesanpham") ||
        sql.includes("UPDATE sanpham")
      ) {
        stockUpdates.push(sql);
      }
      if (sql.includes("UPDATE phieunhap SET TrangThai")) status = "completed";
      return [{ affectedRows: 1 }, []];
    },
  };

  const model = loadAdminModel(connection);
  await model.receiveImport(5);
  await model.receiveImport(5);

  assert.equal(status, "completed");
  assert.equal(stockUpdates.length, 2);
});
