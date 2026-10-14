/**
 * src/lib/env.ts
 *
 * Server-side environment validation using Zod v4.
 * Import this module only from server code. Do not import it from
 * Client Components — NEXT_PUBLIC_* values are the only variables
 * safe to expose in the browser, and those can be read via
 * process.env.NEXT_PUBLIC_* in client code.
 *
 * Usage (server):
 *   import { getEnv, parseEnv } from "@/lib/env";
 *   const env = getEnv();
 *
 * parseEnv() is exported so tests can validate arbitrary objects
 * without touching process.env.
 */

import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  value === "" || value === undefined ? undefined : value;

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default("http://localhost:3000")
  ),
});

const serverEnvSchema = publicEnvSchema.extend({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Optional for the UI-only local demo. Required only when using Prisma queries.
  DATABASE_URL: z.preprocess(emptyToUndefined, z.string().min(1).optional()),

  WAYRO_DATA_DIR: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  AUTH_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  AUTH_GOOGLE_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  AUTH_GOOGLE_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  AUTH_GITHUB_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  AUTH_GITHUB_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),

  AI_PROVIDER: z
    .enum(["openai", "anthropic", "google", "mock"])
    .default("mock"),
  OPENAI_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  ANTHROPIC_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  GOOGLE_GENERATIVE_AI_API_KEY: z.preprocess(
    emptyToUndefined,
    z.string().optional()
  ),
}).superRefine((data, ctx) => {
  if (data.AUTH_SECRET && data.AUTH_SECRET.length < 32) {
    ctx.addIssue({
      code: "custom",
      path: ["AUTH_SECRET"],
      message: "AUTH_SECRET must be at least 32 characters when set",
    });
  }
});

export type Env = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

function formatIssues(issues: z.ZodIssue[]): string {
  return issues
    .map((issue) => `  • ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}

/**
 * Parse and validate an environment-like object.
 * Never includes secret values in the thrown error message.
 */
export function parseEnv(
  source: Record<string, string | undefined> = process.env
): Env {
  const result = serverEnvSchema.safeParse(source);

  if (!result.success) {
    throw new Error(
      `Invalid environment variables:\n${formatIssues(result.error.issues)}\n\nSee .env.example for placeholders. Secret values are not printed.`
    );
  }

  return result.data;
}

let cached: Env | undefined;

/**
 * Lazy accessor so importing this module does not throw during tests
 * or static analysis before env is configured.
 */
export function getEnv(): Env {
  if (!cached) {
    cached = parseEnv();
  }
  return cached;
}

/** Reset cached env — used by tests only. */
export function resetEnvCache(): void {
  cached = undefined;
}

/**
 * Convenience object that reads through getEnv().
 * Accessing a property triggers validation on first use.
 */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string | symbol) {
    return getEnv()[prop as keyof Env];
  },
});
