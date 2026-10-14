"use client";

import { useState } from "react";
import { PageHeading, SectionCard, FormField } from "@/components/ui";
import { useAppState } from "@/components/app/AppStateProvider";
import type { HackathonProposal } from "@/types";

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Challenge details",
  2: "Team & resources",
  3: "Constraints & context",
};

/* ── Step indicator ─────────────────────────────────────────────────────── */
function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <nav aria-label="Form progress" className="mb-8">
      <ol className="flex items-center gap-0">
        {Array.from({ length: total }, (_, i) => {
          const stepNum = (i + 1) as Step;
          const isDone    = stepNum < current;
          const isActive  = stepNum === current;
          return (
            <li key={stepNum} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: isDone ? "var(--success-500)" : isActive ? "var(--brand-600)" : "var(--bg-sunken)",
                    color: isDone || isActive ? "#fff" : "var(--text-muted)",
                  }}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isDone ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : stepNum}
                </span>
                <span className="text-xs text-center" style={{ color: isActive ? "var(--brand-600)" : "var(--text-muted)" }}>
                  {STEP_LABELS[stepNum]}
                </span>
              </div>
              {stepNum < total && (
                <div className="flex-1 h-0.5 mx-2 mb-5" style={{ background: isDone ? "var(--success-500)" : "var(--border)" }} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── Hackathon Lab page ─────────────────────────────────────────────────── */
export default function HackathonLabPage() {
  const { state, refresh, patch, error: stateError } = useAppState();
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [proposalEdits, setProposalEdits] = useState<Record<string, Pick<HackathonProposal, "title" | "problem" | "proposedInnovation">>>({});

  // Form state
  const [form, setForm] = useState({
    // Step 1
    hackathonName: "",
    domain: "",
    projectType: "",
    theme: "",
    // Step 2
    teamSize: "",
    devHours: "",
    skills: "",
    // Step 3
    budget: "",
    constraints: "",
    goals: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validateStep(s: Step): boolean {
    const newErrors: typeof errors = {};
    if (s === 1) {
      if (!form.domain.trim()) newErrors.domain = "Domain is required";
      if (!form.projectType) newErrors.projectType = "Select a project type";
    }
    if (s === 2) {
      if (!form.teamSize) newErrors.teamSize = "Team size is required";
      if (!form.devHours.trim()) newErrors.devHours = "Estimated dev hours is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function next() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, 3) as Step);
  }
  function back() { setStep((s) => Math.max(s - 1, 1) as Step); }

  function editProposal(
    proposal: HackathonProposal,
    field: keyof Pick<HackathonProposal, "title" | "problem" | "proposedInnovation">,
    value: string
  ) {
    setProposalEdits((current) => ({
      ...current,
      [proposal.id]: {
        title: current[proposal.id]?.title ?? proposal.title,
        problem: current[proposal.id]?.problem ?? proposal.problem,
        proposedInnovation: current[proposal.id]?.proposedInnovation ?? proposal.proposedInnovation,
        [field]: value,
      },
    }));
  }

  async function saveProposal(proposalId: string) {
    const draft = proposalEdits[proposalId];
    if (!draft) return;
    const result = await patch({ updateProposal: { id: proposalId, patch: draft } });
    if (!result) {
      setProposalEdits((current) => {
        const next = { ...current };
        delete next[proposalId];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep(step)) return;
    setBusy(true);
    setRequestError("");
    try {
      const response = await fetch("/api/hackathon/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeName: form.hackathonName,
          domain: form.domain,
          projectType: form.projectType,
          theme: form.theme,
          teamSize: form.teamSize,
          devHours: form.devHours,
          skills: form.skills,
          budget: form.budget,
          constraints: form.constraints,
          goals: form.goals,
        }),
      });
      const result: { ok: boolean; error?: string } = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error ?? `Proposal generation failed (${response.status})`);
      await refresh();
      setSubmitted(true);
    } catch (failure) {
      setRequestError(failure instanceof Error ? failure.message : "Unable to generate proposal drafts.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="animate-fadein max-w-2xl mx-auto">
        <PageHeading title="Hackathon Lab" />
        <div className="space-y-5">
          <SectionCard>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Preliminary project directions</h3>
                <p className="text-sm mt-1 text-slate-600">Generated from your constraints and saved locally. These drafts are not research findings.</p>
              </div>
              <button onClick={() => { setSubmitted(false); setStep(1); }} className="btn btn-secondary btn-sm">New challenge</button>
            </div>
          </SectionCard>
          {state.proposals.length === 0 ? <SectionCard><p className="text-sm">No proposal drafts are available. Return to the form and generate them again.</p></SectionCard> : state.proposals.map((proposal) => (
            <SectionCard key={proposal.id}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex gap-2 items-center">
                  <span className="badge badge-warning">{proposal.isPreliminary ? "Hypothesis / preliminary" : "Proposal"}</span>
                  {proposal.selected && <span className="badge badge-success">Selected</span>}
                </div>
                <button className="btn btn-secondary btn-sm" aria-pressed={proposal.selected} onClick={() => void patch({ selectProposal: proposal.id })}>{proposal.selected ? "Selected proposal" : "Select proposal"}</button>
              </div>
              <label className="text-sm font-semibold block mb-1" htmlFor={`proposal-title-${proposal.id}`}>Proposal title</label>
              <input id={`proposal-title-${proposal.id}`} className="input mb-4" maxLength={160} value={proposalEdits[proposal.id]?.title ?? proposal.title} onChange={(event) => editProposal(proposal, "title", event.target.value)} />
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><label className="font-semibold" htmlFor={`proposal-problem-${proposal.id}`}>Problem statement</label><textarea id={`proposal-problem-${proposal.id}`} className="input mt-1" rows={4} maxLength={2000} value={proposalEdits[proposal.id]?.problem ?? proposal.problem} onChange={(event) => editProposal(proposal, "problem", event.target.value)} /></div>
                <div><strong>Target users</strong><p className="text-slate-600 mt-1">{proposal.targetUsers}</p></div>
                <div><strong>Existing approaches</strong><p className="text-slate-600 mt-1">{proposal.existingApproaches}</p></div>
                <div><label className="font-semibold" htmlFor={`proposal-innovation-${proposal.id}`}>Innovation hypothesis</label><textarea id={`proposal-innovation-${proposal.id}`} className="input mt-1" rows={4} maxLength={2000} value={proposalEdits[proposal.id]?.proposedInnovation ?? proposal.proposedInnovation} onChange={(event) => editProposal(proposal, "proposedInnovation", event.target.value)} /></div>
                <div><strong>Architecture & MVP</strong><p className="text-slate-600 mt-1">{proposal.architecture} {proposal.mvpScope}</p></div>
                <div><strong>Feasibility & risks</strong><p className="text-slate-600 mt-1">{proposal.feasibility} {proposal.risks.join(" · ")}</p></div>
                <div><strong>Evaluation</strong><p className="text-slate-600 mt-1">{proposal.evaluationMetrics.join(" · ")}</p></div>
                <div><strong>Evidence status</strong><p className="text-slate-600 mt-1">{proposal.evidenceNotes} {proposal.limitations}</p></div>
              </div>
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer font-medium">Additional hypotheses and constraints</summary>
                <p className="mt-2 text-slate-600">{proposal.hypothesisGaps.join(" · ")}</p>
                <p className="mt-2 text-slate-600">Constraints: {proposal.constraints || "None provided"} · Technologies: {proposal.technologies.join(", ")}</p>
              </details>
              <div className="flex justify-end mt-4">
                <button className="btn btn-secondary btn-sm" disabled={!proposalEdits[proposal.id]} onClick={() => void saveProposal(proposal.id)}>Save refinements</button>
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadein max-w-2xl mx-auto">
      <PageHeading
        title="Hackathon Lab"
        subtitle="Draft a feasible project direction and keep evidence separate from hypotheses"
      />

      {/* What the lab does */}
      <SectionCard className="mb-6">
        <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>
          What Hackathon Lab will do
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { n: "1", t: "Draft candidate directions", d: "Generate several problem framings from your challenge and team constraints" },
            { n: "2", t: "Separate claims from evidence", d: "Keep unverified user needs and market gaps labelled as hypotheses" },
            { n: "3", t: "Review feasibility", d: "Compare time, skills, budget, MVP scope, and implementation risks" },
            { n: "4", t: "Refine a proposal", d: "Select and edit a draft, then plan how to validate it with real sources" },
          ].map(({ n, t, d }) => (
            <div key={n} className="flex gap-3 p-3 rounded-lg" style={{ background: "var(--bg-sunken)" }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "var(--brand-100)", color: "var(--brand-700)" }}>{n}</span>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{t}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs mt-4 p-3 rounded-lg" style={{ background: "var(--warning-50)", color: "var(--warning-700)", border: "1px solid #fde68a" }}>
          The generator creates deterministic brainstorming drafts. No web research or AI provider is configured; all unmet-need statements remain hypotheses.
        </p>
      </SectionCard>

      {/* Multi-step form */}
      <SectionCard>
        <StepIndicator current={step} total={3} />

        <form onSubmit={handleSubmit} noValidate>
          {(requestError || stateError) && <p role="alert" className="mb-4 text-sm text-red-700">{requestError || stateError}</p>}
          {/* ── Step 1 ────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-fadein">
              <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Challenge details</h3>

              <FormField id="hackathonName" label="Hackathon or challenge name" hint="Optional — helps contextualise research">
                <input id="hackathonName" className="input" value={form.hackathonName} onChange={(e) => update("hackathonName", e.target.value)} placeholder="e.g. Smart Cities Hackathon 2024" />
              </FormField>

              <FormField id="domain" label="Problem domain" required error={errors.domain} hint="The broad area you want to address">
                <input id="domain" className="input" value={form.domain} onChange={(e) => update("domain", e.target.value)} placeholder="e.g. Urban mobility, Healthcare, Education" />
              </FormField>

              <FormField id="projectType" label="Project type" required error={errors.projectType}>
                <select id="projectType" className="input" value={form.projectType} onChange={(e) => update("projectType", e.target.value)}>
                  <option value="">Select type…</option>
                  <option value="software">Software</option>
                  <option value="hardware">Hardware</option>
                  <option value="hybrid">Hybrid (software + hardware)</option>
                  <option value="data">Data science / ML</option>
                  <option value="design">Design / UX</option>
                </select>
              </FormField>

              <FormField id="theme" label="Challenge theme or prompt" hint="Paste the theme statement if you have one">
                <textarea id="theme" className="input" rows={3} value={form.theme} onChange={(e) => update("theme", e.target.value)} placeholder="e.g. 'Build a solution that helps underserved communities access public services'" />
              </FormField>
            </div>
          )}

          {/* ── Step 2 ────────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5 animate-fadein">
              <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Team & resources</h3>

              <FormField id="teamSize" label="Team size" required error={errors.teamSize}>
                <select id="teamSize" className="input" value={form.teamSize} onChange={(e) => update("teamSize", e.target.value)}>
                  <option value="">Select…</option>
                  <option value="solo">Solo</option>
                  <option value="2">2 people</option>
                  <option value="3">3 people</option>
                  <option value="4">4 people</option>
                  <option value="5+">5 or more</option>
                </select>
              </FormField>

              <FormField id="devHours" label="Available development time (hours)" required error={errors.devHours} hint="Total hours across the team for the hackathon">
                <input id="devHours" type="number" className="input" min={1} value={form.devHours} onChange={(e) => update("devHours", e.target.value)} placeholder="e.g. 48" />
              </FormField>

              <FormField id="skills" label="Team skills & technologies" hint="Comma-separated list of technologies or disciplines your team knows">
                <textarea id="skills" className="input" rows={3} value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="e.g. React, Python, IoT, Machine Learning, UI/UX Design" />
              </FormField>
            </div>
          )}

          {/* ── Step 3 ────────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5 animate-fadein">
              <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Constraints & context</h3>

              <FormField id="budget" label="Budget" hint="Leave blank if no budget constraints apply">
                <input id="budget" className="input" value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="e.g. No budget / ₹5,000 / $200" />
              </FormField>

              <FormField id="constraints" label="Technical or access constraints" hint="Hardware access, internet connectivity, required APIs, etc.">
                <textarea id="constraints" className="input" rows={3} value={form.constraints} onChange={(e) => update("constraints", e.target.value)} placeholder="e.g. No physical hardware available, must use free APIs only" />
              </FormField>

              <FormField id="goals" label="What does success look like for your team?" hint="Optional — helps the research focus on feasible outcomes">
                <textarea id="goals" className="input" rows={3} value={form.goals} onChange={(e) => update("goals", e.target.value)} placeholder="e.g. Build a working demo, win the social impact track, learn a new technology" />
              </FormField>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
            <button type="button" onClick={back} disabled={step === 1} className="btn btn-secondary" aria-label="Previous step">
              Back
            </button>
            {step < 3 ? (
              <button type="button" onClick={next} className="btn btn-primary" aria-label="Next step">
                Continue →
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" id="hackathon-lab-submit" disabled={busy}>
                {busy ? "Drafting proposals…" : "Generate proposal drafts"}
              </button>
            )}
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
