import AppShell from "@/components/layout/AppShell";
import { AUTH_COOKIE_NAME, getSessionUserId } from "@/lib/auth/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { ReactNode } from "react";

/**
 * (app)/layout.tsx
 *
 * Route group layout for all authenticated application pages.
 * Wraps children with the persistent app shell (sidebar + header).
 *
 * The parentheses in (app) make this a Next.js route group —
 * it does NOT appear in the URL. All routes inside are at the root:
 *   /dashboard, /opportunities, /readiness, etc.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  if (!getSessionUserId(cookieStore.get(AUTH_COOKIE_NAME)?.value)) redirect("/login");

  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500" role="status">Loading WAYRO AI…</div>}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
