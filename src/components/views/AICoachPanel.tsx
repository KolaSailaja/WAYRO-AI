"use client";

import { useState } from "react";
import { SectionCard } from "@/components/ui";
import type { Opportunity } from "@/types";

interface CoachResult {
  plan: {
    opportunityTitle: string;
    summary: string;
    strengths: string[];
    missingSkills: string[];
    nextSteps: string[];
    caveat: string;
  };
  provider: string;
  model: string;
  response: string;
  generatedAt: string;
}

export function AICoachPanel({ opportunity }: { opportunity?: Opportunity | null }) {
  const [result, setResult] = useState<CoachResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!opportunity) return null;
  const selectedOpportunity = opportunity;

  async function generateCoachPlan() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: selectedOpportunity.id }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "The coach could not generate a plan.");
      }
      setResult(payload.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The coach is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="font-semibold text-sm">WAYRO AI coach</h3>
        <span className="badge badge-brand">{result ? result.provider : "Mock demo"}</span>
      </div>

      <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
        {opportunity.title}
      </p>

      {error ? (
        <p role="alert" className="text-sm text-red-700">{error}</p>
      ) : result ? (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{result.plan.summary}</p>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Strengths</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {result.plan.strengths.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Priority gaps</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {result.plan.missingSkills.length > 0 ? (
                result.plan.missingSkills.map((skill) => <li key={skill}>{skill}</li>)
              ) : (
                <li>No major skill gaps were flagged in the demo profile.</li>
              )}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>Next steps</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {result.plan.nextSteps.map((step) => <li key={step}>{step}</li>)}
            </ul>
          </div>

          <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>{result.plan.caveat}</p>
        </div>
      ) : (
        <button className="btn btn-primary btn-sm" onClick={() => void generateCoachPlan()} disabled={loading}>
          {loading ? "Generating…" : "Generate coach plan"}
        </button>
      )}
    </SectionCard>
  );
}
