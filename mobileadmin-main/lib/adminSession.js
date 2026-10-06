import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "elip_admin_session";

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

export function verifyAdminSession(token) {
  try {
    const [encodedPayload, suppliedSignature, extraPart] = String(
      token || "",
    ).split(".");

    if (!encodedPayload || !suppliedSignature || extraPart) return null;

    const expectedSignature = createHmac("sha256", getSessionSecret())
      .update(encodedPayload)
      .digest();
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
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
