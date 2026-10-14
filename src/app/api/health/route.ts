import { NextResponse } from "next/server";
import { parseEnv } from "@/lib/env";
import { getPublicState } from "@/lib/store";

export interface HealthResponse {
  status: "ok";
  timestamp: string;
  version: string;
  environment: string;
  persistence: "demo-local";
  aiProvider: string;
}

export async function GET(): Promise<NextResponse<HealthResponse | { status: "error"; error: string }>> {
  try {
    const env = parseEnv(process.env);
    await getPublicState();
    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? "0.1.0",
        environment: env.NODE_ENV,
        persistence: "demo-local",
        aiProvider: env.AI_PROVIDER,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 503 }
    );
  }
}

export async function POST(): Promise<NextResponse<{ ok: false; error: string }>> {
  return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
}
