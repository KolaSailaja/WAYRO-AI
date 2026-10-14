import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { GET, PATCH } from "@/app/api/state/route";
import { POST as generate } from "@/app/api/hackathon/generate/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as signup } from "@/app/api/auth/signup/route";
import { AUTH_COOKIE_NAME, createSessionToken, getSessionUserId } from "@/lib/auth/session";

const AUTH_SECRET = "test-only-auth-secret-that-is-at-least-32-characters";

describe("student account registration and authentication", () => {
  let previousSecret: string | undefined;
  let previousDataDir: string | undefined;
  let dataDir: string;

  beforeEach(async () => {
    previousSecret = process.env.AUTH_SECRET;
    previousDataDir = process.env.WAYRO_DATA_DIR;
    process.env.AUTH_SECRET = AUTH_SECRET;
    dataDir = await mkdtemp(path.join(tmpdir(), "wayro-auth-test-"));
    process.env.WAYRO_DATA_DIR = dataDir;
  });

  afterEach(async () => {
    if (previousSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousSecret;
    if (previousDataDir === undefined) delete process.env.WAYRO_DATA_DIR;
    else process.env.WAYRO_DATA_DIR = previousDataDir;
    await rm(dataDir, { recursive: true, force: true });
  });

  it("creates a student account and session without an invitation passphrase", async () => {
    const response = await signup(new NextRequest("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost" },
      body: JSON.stringify({ email: "Student@Example.com", password: "a-strong-student-password" }),
    }));

    expect(response.status).toBe(201);
    expect(response.cookies.get(AUTH_COOKIE_NAME)).toMatchObject({
      httpOnly: true,
      sameSite: "strict",
      maxAge: 12 * 60 * 60,
    });
    expect(getSessionUserId(response.cookies.get(AUTH_COOKIE_NAME)?.value)).toMatch(/^[0-9a-f-]{36}$/i);
    const account = await response.json();
    expect(account).toMatchObject({ ok: true, account: { email: "student@example.com" } });
    expect(account.account).not.toHaveProperty("password");
    const storedAccounts = await readFile(path.join(dataDir, "accounts.json"), "utf8");
    expect(storedAccounts).not.toContain("a-strong-student-password");
    expect(storedAccounts).toContain('"passwordHash"');

    const loginResponse = await login(new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost" },
      body: JSON.stringify({ email: "student@example.com", password: "a-strong-student-password" }),
    }));
    expect(loginResponse.status).toBe(200);
  });

  it("rejects invalid signup data and weak passwords", async () => {
    const invalidEmail = await signup(new NextRequest("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost" },
      body: JSON.stringify({ email: "not-an-email", password: "a-strong-student-password" }),
    }));
    const weakPassword = await signup(new NextRequest("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost" },
      body: JSON.stringify({ email: "student@example.com", password: "short" }),
    }));

    expect(invalidEmail.status).toBe(400);
    expect(weakPassword.status).toBe(400);
  });

  it("rejects duplicate email addresses case-insensitively", async () => {
    const register = (email: string) => signup(new NextRequest("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost" },
      body: JSON.stringify({ email, password: "a-strong-student-password" }),
    }));

    expect((await register("student@example.com")).status).toBe(201);
    expect((await register("STUDENT@example.com")).status).toBe(409);
  });

  it("rejects signup requests from another origin", async () => {
    const response = await signup(new NextRequest("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://attacker.example" },
      body: JSON.stringify({ email: "student@example.com", password: "a-strong-student-password" }),
    }));
    expect(response.status).toBe(403);
  });
});

describe("authenticated student state APIs", () => {
  let previousSecret: string | undefined;
  let previousDataDir: string | undefined;
  let dataDir: string;

  beforeEach(async () => {
    previousSecret = process.env.AUTH_SECRET;
    previousDataDir = process.env.WAYRO_DATA_DIR;
    process.env.AUTH_SECRET = AUTH_SECRET;
    dataDir = await mkdtemp(path.join(tmpdir(), "wayro-state-test-"));
    process.env.WAYRO_DATA_DIR = dataDir;
  });

  afterEach(async () => {
    if (previousSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousSecret;
    if (previousDataDir === undefined) delete process.env.WAYRO_DATA_DIR;
    else process.env.WAYRO_DATA_DIR = previousDataDir;
    await rm(dataDir, { recursive: true, force: true });
  });

  function sessionCookie(userId = randomUUID()) {
    return `${AUTH_COOKIE_NAME}=${createSessionToken(userId)}`;
  }

  it("requires a valid session before returning workspace state", async () => {
    const response = await GET(new NextRequest("http://localhost/api/state"));
    expect(response.status).toBe(401);
  });

  it("requires a valid session before generating proposals", async () => {
    const response = await generate(new NextRequest("http://localhost/api/hackathon/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }));
    expect(response.status).toBe(401);
  });

  it("rejects login with an incorrect student password", async () => {
    await signup(new NextRequest("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost" },
      body: JSON.stringify({ email: "student@example.com", password: "a-strong-student-password" }),
    }));
    const response = await login(new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost" },
      body: JSON.stringify({ email: "student@example.com", password: "incorrect-student-password" }),
    }));
    expect(response.status).toBe(401);
  });

  it("keeps each student's saved workspace data isolated", async () => {
    const firstUser = randomUUID();
    const secondUser = randomUUID();
    const update = await PATCH(new NextRequest("http://localhost/api/state", {
      method: "PATCH",
      headers: { "content-type": "application/json", cookie: sessionCookie(firstUser) },
      body: JSON.stringify({ profile: { name: "First student" } }),
    }));
    expect(update.status).toBe(200);

    const first = await GET(new NextRequest("http://localhost/api/state", {
      headers: { cookie: sessionCookie(firstUser) },
    }));
    const second = await GET(new NextRequest("http://localhost/api/state", {
      headers: { cookie: sessionCookie(secondUser) },
    }));
    expect((await first.json()).data.profile.name).toBe("First student");
    expect((await second.json()).data.profile.name).not.toBe("First student");
  });

  it("returns 400 for malformed state JSON", async () => {
    const response = await PATCH(new NextRequest("http://localhost/api/state", {
      method: "PATCH",
      headers: { "content-type": "application/json", cookie: sessionCookie() },
      body: "{",
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ ok: false, error: "Invalid JSON body." });
  });

  it("rejects unknown opportunity IDs without mutating state", async () => {
    const response = await PATCH(new NextRequest("http://localhost/api/state", {
      method: "PATCH",
      headers: { "content-type": "application/json", cookie: sessionCookie() },
      body: JSON.stringify({ toggleSave: "not-in-catalog" }),
    }));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "Opportunity does not exist in the current catalogue.",
    });
  });

  it("enforces the state API request size limit", async () => {
    const response = await PATCH(new NextRequest("http://localhost/api/state", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "content-length": `${256 * 1024 + 1}`,
        cookie: sessionCookie(),
      },
      body: "{}",
    }));
    expect(response.status).toBe(413);
  });
});
