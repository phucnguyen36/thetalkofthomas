import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "thomas_admin";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSessionSecret(): Buffer | null {
  const explicitSecret = process.env.SESSION_SECRET?.trim();
  if (explicitSecret) {
    return crypto.createHash("sha256").update(explicitSecret).digest();
  }

  // Fallback to deriving a signing key from ADMIN_PASSWORD so existing
  // deployments keep working until SESSION_SECRET is added explicitly.
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  if (adminPassword) {
    return crypto
      .createHash("sha256")
      .update(`thetalkofthomas:session:${adminPassword}`)
      .digest();
  }

  return null;
}

export function safeEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function createAdminSessionToken(email: string): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const payload = Buffer.from(
    JSON.stringify({
      email,
      exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const secret = getSessionSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  if (!payload || !signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    return typeof decoded.exp === "number" && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export function isAdminRequest(cookieStore: {
  get(name: string): { value: string } | undefined;
}): boolean {
  return verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}
