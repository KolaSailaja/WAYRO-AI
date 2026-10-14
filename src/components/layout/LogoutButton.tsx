"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function signOut() {
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error(`The server returned ${response.status}.`);
      router.replace("/login");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? `Unable to sign out: ${cause.message}` : "Unable to sign out.");
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-700" role="alert">{error}</span>}
      <button
        type="button"
        onClick={signOut}
        className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        Sign out
      </button>
    </div>
  );
}
