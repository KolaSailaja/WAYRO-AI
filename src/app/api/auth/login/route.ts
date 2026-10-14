import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  isAuthConfigured,
  hasSameOrigin,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";
import { authenticateAccount } from "@/lib/auth/accounts";
import { readJsonRequest } from "@/lib/server/read-json";

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "Cross-origin login requests are not allowed." }, { status: 403 });
  }
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Configure AUTH_SECRET to enable sign-in." },
      { status: 503 }
    );
  }

  const result = await readJsonRequest(request, 4096);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  const parsed = loginSchema.safeParse(result.value);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Enter a valid email and password." }, { status: 400 });
  }
  const account = await authenticateAccount(parsed.data.email, parsed.data.password);
  if (!account) {
    return NextResponse.json({ ok: false, error: "Email or password is incorrect." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, createSessionToken(account.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
