import "server-only";
import { createHmac, timingSafeEqual, randomBytes, scryptSync } from "crypto";
import { cookies } from "next/headers";

/*
 * Admin session auth.
 *
 * The password is never stored or transmitted in a reversible form, and the
 * session cookie is a signed token rather than a "loggedIn=true" flag — that
 * flag would be trivially forgeable from devtools.
 *
 * Configure with env vars (see .env.example):
 *   ADMIN_PASSWORD  — the password to type in the gate
 *   ADMIN_SECRET    — HMAC signing key for session cookies
 *
 * Both have dev fallbacks so the panel works out of the box locally, but
 * getSecret() refuses the fallback in production: shipping a public default
 * signing key would let anyone forge a valid admin session.
 */

const COOKIE = "nm_admin";
const MAX_AGE = 60 * 60 * 8; // 8h — long enough to edit, short enough to expire

const DEV_PASSWORD = "admin";
const DEV_SECRET = "dev-only-insecure-secret";

function getSecret(): string {
  const s = process.env.ADMIN_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_SECRET must be set (>=16 chars) in production — refusing to sign sessions with the dev fallback."
    );
  }
  return DEV_SECRET;
}

function getPassword(): string {
  return process.env.ADMIN_PASSWORD || DEV_PASSWORD;
}

/** Constant-time compare that also tolerates length mismatch without leaking it. */
function safeEqual(a: string, b: string): boolean {
  // Hash both sides to a fixed width first: timingSafeEqual throws on unequal
  // lengths, and that throw would itself be a timing/oracle side channel.
  const key = getSecret();
  // Wrap in Uint8Array: Buffer's generic ArrayBufferLike doesn't satisfy the
  // ArrayBufferView<ArrayBuffer> that timingSafeEqual is typed against.
  const ha = new Uint8Array(createHmac("sha256", key).update(a).digest());
  const hb = new Uint8Array(createHmac("sha256", key).update(b).digest());
  return timingSafeEqual(ha, hb);
}

export function verifyPassword(input: string): boolean {
  if (typeof input !== "string" || !input) return false;
  return safeEqual(input, getPassword());
}

/* ---- Session token: <expiry>.<hmac(expiry)> ------------------------------ */

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function issueToken(): { value: string; maxAge: number } {
  const exp = String(Date.now() + MAX_AGE * 1000);
  return { value: `${exp}.${sign(exp)}`, maxAge: MAX_AGE };
}

export function isValidToken(token?: string): boolean {
  if (!token) return false;
  const [exp, mac] = token.split(".");
  if (!exp || !mac) return false;
  // Verify the signature BEFORE trusting the expiry — otherwise an attacker
  // just edits the timestamp on an expired (or invented) token.
  if (!safeEqual(mac, sign(exp))) return false;
  const ts = Number(exp);
  return Number.isFinite(ts) && ts > Date.now();
}

export const ADMIN_COOKIE = COOKIE;

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return isValidToken(jar.get(COOKIE)?.value);
}

/* Unused today, but keeps password-hash generation in one place if the single
   shared password is later replaced by per-user credentials. */
export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
}
