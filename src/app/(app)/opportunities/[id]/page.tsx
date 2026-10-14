"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppState } from "@/components/app/AppStateProvider";
import { PageHeading, SectionCard } from "@/components/ui";
import { evaluateTrust } from "@/lib/trust/flags";
import type { ApplicationStatus } from "@/types";

const STATUSES: ApplicationStatus[] = ["interested", "preparing", "applied", "shortlisted", "selected", "rejected", "withdrawn"];

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const { state, catalog, patch, error } = useAppState();
  const opportunity = catalog.find((item) => item.id === params.id);

  if (!opportunity) {
    return (
      <SectionCard>
        <PageHeading title="Opportunity not found" subtitle="This listing is not available in the current catalogue." />
        <Link className="btn btn-primary btn-sm" href="/opportunities">Back to opportunities</Link>
      </SectionCard>
    );
  }

  const application = state.applications.find((item) => item.opportunityId === opportunity.id);
  const trust = evaluateTrust(opportunity);

  return (
    <div className="animate-fadein max-w-4xl mx-auto">
      <Link href="/opportunities" className="text-sm text-indigo-700">← All opportunities</Link>
      <PageHeading title={opportunity.title} subtitle={`${opportunity.organization} · ${opportunity.type.replace("_", " ")}`} />
      {error && <p role="alert" className="card p-3 mb-4 text-sm text-red-700">{error}</p>}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <SectionCard>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge badge-warning">{opportunity.isDemo ? "Demonstration listing" : "External listing"}</span>
              {opportunity.remote && <span className="badge badge-gray">Remote</span>}
              {opportunity.location && <span className="badge badge-gray">{opportunity.location}</span>}
            </div>
            <p className="text-sm leading-6">{opportunity.description}</p>
            <h2 className="font-semibold mt-5 mb-2">Requirements</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">{opportunity.requirements.map((item) => <li key={item}>{item}</li>)}</ul>
            <h2 className="font-semibold mt-5 mb-2">Eligibility</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">{opportunity.eligibility.map((item) => <li key={item}>{item}</li>)}</ul>
            <h2 className="font-semibold mt-5 mb-2">Skills</h2>
            <p className="text-sm">{opportunity.skills.length ? opportunity.skills.join(" · ") : "No specific skills listed."}</p>
          </SectionCard>
          <SectionCard>
            <h2 className="font-semibold mb-2">Listing trust notes</h2>
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{trust.summary}</p>
            {trust.flags.length > 0 && <ul className="space-y-2">{trust.flags.map((flag) => <li key={flag.id} className="text-sm">{flag.severity === "caution" ? "⚠ " : "ℹ "}{flag.message}</li>)}</ul>}
            <p className="text-xs mt-3 text-slate-500">WAYRO has not checked link availability. Always verify details at an official source before sharing personal information.</p>
          </SectionCard>
        </div>
        <aside className="space-y-5">
          <SectionCard>
            <h2 className="font-semibold mb-3">Track your application</h2>
            <label htmlFor="application-status" className="text-sm block mb-2">Status</label>
            <select id="application-status" className="input mb-4" value={application?.status ?? "interested"} onChange={(event) => void patch({ application: { opportunityId: opportunity.id, status: event.target.value } })}>
              {STATUSES.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
            </select>
            <button type="button" className="btn btn-secondary w-full" aria-pressed={state.savedIds.includes(opportunity.id)} onClick={() => void patch({ toggleSave: opportunity.id })}>
              {state.savedIds.includes(opportunity.id) ? "Remove saved listing" : "Save opportunity"}
            </button>
          </SectionCard>
          <SectionCard>
            <h2 className="font-semibold mb-3">Deadline</h2>
            <p className="text-sm">{opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString("en-GB", { timeZone: "UTC" }) : "Not listed"}</p>
            <p className="text-xs mt-1 text-slate-500">A sample deadline is not evidence of a real opening.</p>
            <a className="btn btn-primary w-full mt-4" href={opportunity.applicationUrl} target="_blank" rel="noopener noreferrer">
              Open application source ↗
            </a>
            {opportunity.sourceUrl && <a className="block text-sm text-indigo-700 mt-3 break-all" href={opportunity.sourceUrl} target="_blank" rel="noopener noreferrer">Source page ↗</a>}
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
