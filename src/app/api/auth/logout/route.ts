import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, hasSameOrigin } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "Cross-origin logout requests are not allowed." }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
