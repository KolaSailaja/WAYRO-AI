import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSessionToken, getSessionUserId, isAuthConfigured, SESSION_MAX_AGE_SECONDS } from "./session";

const AUTH_SECRET = "test-only-auth-secret-that-is-at-least-32-characters";
const USER_ID = "92c45708-2089-4be0-aeec-1c6506acfe49";

describe("student sessions", () => {
  let previousSecret: string | undefined;

  beforeEach(() => {
    previousSecret = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = AUTH_SECRET;
  });

  afterEach(() => {
    if (previousSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousSecret;
  });

  it("requires a sufficiently strong session secret", () => {
    expect(isAuthConfigured()).toBe(true);
    process.env.AUTH_SECRET = "too-short";
    expect(isAuthConfigured()).toBe(false);
  });

  it("signs a session to one student and rejects tampering or expiry", () => {
    const issuedAt = 1_800_000_000_000;
    const token = createSessionToken(USER_ID, issuedAt);

    expect(getSessionUserId(token, issuedAt)).toBe(USER_ID);
    expect(getSessionUserId(token, issuedAt + SESSION_MAX_AGE_SECONDS * 1000)).toBe(USER_ID);
    expect(getSessionUserId(token, issuedAt + (SESSION_MAX_AGE_SECONDS + 1) * 1000)).toBeNull();
    expect(getSessionUserId(`${token}tampered`, issuedAt)).toBeNull();
    expect(getSessionUserId(createSessionToken("23c45708-2089-4be0-aeec-1c6506acfe49", issuedAt), issuedAt)).not.toBe(USER_ID);
  });
});
