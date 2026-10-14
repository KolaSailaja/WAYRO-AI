import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAccount, AccountAlreadyExistsError } from "@/lib/auth/accounts";
import { AUTH_COOKIE_NAME, createSessionToken, hasSameOrigin, isAuthConfigured, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";
import { readJsonRequest } from "@/lib/server/read-json";

const signupSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
  name: z.string().trim().max(100).optional(),
});

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "Cross-origin signup requests are not allowed." }, { status: 403 });
  }
  if (!isAuthConfigured()) {
    return NextResponse.json({ ok: false, error: "Configure AUTH_SECRET to enable account creation." }, { status: 503 });
  }

  const result = await readJsonRequest(request, 4096);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }
  const parsed = signupSchema.safeParse(result.value);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") },
      { status: 400 }
    );
  }

  try {
    const account = await createAccount(parsed.data.email, parsed.data.password, parsed.data.name);
    const response = NextResponse.json({ ok: true, account: { email: account.email, name: account.name } }, { status: 201 });
    response.cookies.set(AUTH_COOKIE_NAME, createSessionToken(account.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    if (error instanceof AccountAlreadyExistsError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 409 });
    }
    throw error;
  }
}
