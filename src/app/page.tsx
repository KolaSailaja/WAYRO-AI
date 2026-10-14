import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WAYRO AI — Find Your Way. Make It Happen.",
};

const STEPS = ["Discover", "Assess", "Learn", "Build", "Apply", "Achieve"] as const;

export default function LandingPage() {
  return (
    <div className="min-h-full" style={{ background: "var(--bg)" }}>
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <p className="font-bold tracking-tight">
          WAYRO <span style={{ color: "var(--brand-600)" }}>AI</span>
        </p>
        <Link href="/dashboard" className="btn btn-primary btn-sm">
          Open workspace
        </Link>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--brand-600)" }}>
          From Opportunity to Achievement
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Find Your Way. Make It Happen.
        </h1>
        <p className="text-lg mb-8 max-w-2xl" style={{ color: "var(--text-secondary)" }}>
          WAYRO AI helps students discover suitable opportunities, understand readiness, close skill gaps,
          prepare hackathon proposals, and track progress. The local app uses labelled demonstration listings
          unless you connect a live data source.
        </p>
        <div className="flex flex-wrap gap-3 mb-12">
          <Link href="/dashboard" className="btn btn-primary">
            Enter dashboard
          </Link>
          <Link href="/journey" className="btn btn-secondary">
            Explore the 3D journey
          </Link>
        </div>
        <ol className="grid sm:grid-cols-3 gap-3">
          {STEPS.map((step, i) => (
            <li key={step} className="card p-4">
              <p className="text-xs font-bold" style={{ color: "var(--brand-600)" }}>
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="font-semibold">{step}</p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
