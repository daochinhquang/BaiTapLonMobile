const { createHmac, timingSafeEqual } = require("node:crypto");

const SESSION_TTL_SECONDS = 8 * 60 * 60;
const DEVELOPMENT_SECRET =
  "local-admin-session-secret-change-before-production";

function getSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : DEVELOPMENT_SECRET);

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET must be configured in production.");
  }

  return secret;
}

function signatureFor(encodedPayload) {
  return createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function createAdminSession(user, now = Date.now()) {
  const payload = {
    exp: Math.floor(now / 1000) + SESSION_TTL_SECONDS,
    id: String(user.MaNguoiDung),
    name: String(user.HoTen || "Admin"),
    role: "admin",
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  return `${encodedPayload}.${signatureFor(encodedPayload)}`;
}

function verifyAdminSession(token, now = Date.now()) {
  try {
    const [encodedPayload, suppliedSignature, extraPart] = String(
      token || "",
    ).split(".");

    if (!encodedPayload || !suppliedSignature || extraPart) return null;

    const expectedSignature = Buffer.from(
      signatureFor(encodedPayload),
      "base64url",
    );
    const actualSignature = Buffer.from(suppliedSignature, "base64url");

    if (
      expectedSignature.length !== actualSignature.length ||
      !timingSafeEqual(expectedSignature, actualSignature)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );

    if (
      payload.role !== "admin" ||
      !payload.id ||
      payload.exp <= Math.floor(now / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function requireAdmin(req, res, next) {
  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  const session = verifyAdminSession(token);

  if (!session) {
    return res
      .status(401)
      .json({ message: "Vui lòng đăng nhập tài khoản quản trị." });
  }

  req.adminSession = session;
  return next();
}

module.exports = { createAdminSession, requireAdmin, verifyAdminSession };
