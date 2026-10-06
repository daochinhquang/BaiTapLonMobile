const MAX_MYSQL_INT = 2_147_483_647;

function invalidCodeError() {
  const error = new Error('Mã loại sản phẩm phải có dạng LSP001 hoặc là một số nguyên dương.');
  error.status = 400;
  return error;
}

function normalizeProductTypeCode(value) {
  if (typeof value === 'number') {
    if (Number.isSafeInteger(value) && value > 0 && value <= MAX_MYSQL_INT) return value;
    throw invalidCodeError();
  }

  if (typeof value !== 'string') throw invalidCodeError();

  const match = value.trim().toUpperCase().match(/^(?:LSP)?(\d+)$/);
  if (!match) throw invalidCodeError();

  const code = Number(match[1]);
  if (!Number.isSafeInteger(code) || code <= 0 || code > MAX_MYSQL_INT) {
    throw invalidCodeError();
  }

  return code;
}

module.exports = { normalizeProductTypeCode };
