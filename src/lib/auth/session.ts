import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const AUTH_COOKIE_NAME = "wayro_session";
export const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

function getAuthSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  return secret && Buffer.byteLength(secret) >= 32 ? secret : null;
}

export function isAuthConfigured(): boolean {
  return getAuthSecret() !== null;
}

export function createSessionToken(userId: string, now = Date.now()): string {
  const secret = getAuthSecret();
  if (!secret) throw new Error("AUTH_SECRET must be at least 32 characters.");

  const issuedAt = Math.floor(now / 1000);
  const payload = `${userId}:${issuedAt}`;
  const signature = createHmac("sha256", secret).update(`wayro-session:${payload}`).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function getSessionUserId(token: string | undefined, now = Date.now()): string | null {
  const secret = getAuthSecret();
  if (!secret || !token) return null;

  const match = /^([A-Za-z0-9_-]+)\.([a-f0-9]{64})$/.exec(token);
  if (!match) return null;

  let payload: string;
  try {
    payload = Buffer.from(match[1], "base64url").toString("utf8");
  } catch {
    return null;
  }
  const separator = payload.lastIndexOf(":");
  if (separator <= 0) return null;
  const userId = payload.slice(0, separator);
  const issuedAtText = payload.slice(separator + 1);
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !/^\d{1,12}$/.test(issuedAtText)) return null;

  const issuedAt = Number(issuedAtText);
  const currentTime = Math.floor(now / 1000);
  if (!Number.isSafeInteger(issuedAt) || issuedAt > currentTime + 60) return null;
  if (currentTime - issuedAt > SESSION_MAX_AGE_SECONDS) return null;

  const expected = createHmac("sha256", secret)
    .update(`wayro-session:${userId}:${issuedAt}`)
    .digest();
  const actual = Buffer.from(match[2], "hex");
  return timingSafeEqual(expected, actual) ? userId : null;
}

export function getAuthenticatedUserId(request: NextRequest): string | null {
  return getSessionUserId(request.cookies.get(AUTH_COOKIE_NAME)?.value);
}

export function hasSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return origin === null || origin === request.nextUrl.origin;
}
