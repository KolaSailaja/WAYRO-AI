"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        setError(typeof result.error === "string" ? result.error : "Unable to create your account.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? `Unable to create your account: ${cause.message}` : "Unable to create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-full items-center justify-center px-6 py-12" style={{ background: "var(--bg)" }}>
      <section className="card w-full max-w-md p-8">
        <p className="mb-2 text-sm font-bold tracking-wide" style={{ color: "var(--brand-600)" }}>WAYRO AI</p>
        <h1 className="mb-2 text-2xl font-bold">Create your student account</h1>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          Get started with your email and a password. No invitation code is needed.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">Name <span className="font-normal">(optional)</span></label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>Use at least 12 characters.</p>
          </div>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          Already have an account? <a className="font-semibold underline" href="/login">Sign in</a>
        </p>
      </section>
    </main>
  );
}
