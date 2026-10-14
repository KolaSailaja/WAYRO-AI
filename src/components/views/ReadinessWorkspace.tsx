"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppState } from "@/components/app/AppStateProvider";
import { EmptyState, PageHeading, SectionCard } from "@/components/ui";
import { compareReadiness } from "@/lib/readiness/compare";
import type { Opportunity, ReadinessTask } from "@/types";

export function ReadinessWorkspace() {
  const { state, catalog, patch, error } = useAppState();
  const [opportunityId, setOpportunityId] = useState("");
  const [assessedId, setAssessedId] = useState("");
  const opportunity = catalog.find((item) => item.id === opportunityId);
  const comparison = opportunity ? compareReadiness(state.profile, opportunity) : null;
  const tasks = state.readinessTasks.filter((task) => task.opportunityId === opportunityId);

  async function buildPlan(item: Opportunity) {
    const compare = compareReadiness(state.profile, item);
    const generated: ReadinessTask[] = [
      ...compare.skillMatches
        .filter((skill) => skill.status === "gap")
        .map((skill) => ({
          id: `${item.id}-skill-${skill.skill.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          opportunityId: item.id,
          label: `Build ${skill.skill}`,
          detail: "Practise this skill and add a project or other evidence to your profile.",
          skill: skill.skill,
          resourceId: skill.resourceId,
          completed: false,
        })),
      ...compare.unknownFields.map((field) => ({
        id: `${item.id}-profile-${field}`,
        opportunityId: item.id,
        label: `Add ${field} information`,
        detail: "Update your profile so this part of your readiness can be compared.",
        completed: false,
      })),
      ...compare.requirementItems
        .filter((requirement) => requirement.status === "unknown")
        .map((requirement, index) => ({
          id: `${item.id}-verify-${index}`,
          opportunityId: item.id,
          label: `Verify: ${requirement.requirement}`,
          detail: requirement.note,
          completed: false,
        })),
    ];
    const existingOtherOpportunities = state.readinessTasks.filter((task) => task.opportunityId !== item.id);
    const errorMessage = await patch({ readinessTasks: [...generated, ...existingOtherOpportunities] });
    if (!errorMessage) setAssessedId(item.id);
  }

  return (
    <div className="animate-fadein max-w-4xl mx-auto">
      <PageHeading title="Readiness Assessment" subtitle="Compare a listing with what your profile currently documents." />
      <SectionCard className="mb-5">
        <label htmlFor="readiness-opportunity" className="label">Choose an opportunity</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <select id="readiness-opportunity" className="input flex-1" value={opportunityId} onChange={(event) => { setOpportunityId(event.target.value); setAssessedId(""); }}>
            <option value="">Select a demonstration listing…</option>
            {catalog.map((item) => <option key={item.id} value={item.id}>{item.title} — {item.organization}</option>)}
          </select>
          <button type="button" className="btn btn-primary" disabled={!opportunity} onClick={() => opportunity && void buildPlan(opportunity)}>Assess readiness</button>
        </div>
        <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>This is a transparent profile comparison, not an eligibility decision. Unknown information is not treated as a failure.</p>
      </SectionCard>

      {error && <p role="alert" className="card p-3 mb-4 text-sm text-red-700">{error}</p>}
      {!opportunity ? (
        <SectionCard><EmptyState title="Choose a listing to begin" description="Select an opportunity above to see documented strengths, skill gaps, and unknown eligibility details." /></SectionCard>
      ) : comparison ? (
        <div className="space-y-5">
          <SectionCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="font-semibold">{opportunity.title}</h2><p className="text-sm" style={{ color: "var(--text-secondary)" }}>{opportunity.organization} · {opportunity.isDemo ? "Demonstration listing" : "Source-provided listing"}</p></div>
              <div className="text-right"><strong className="text-2xl text-indigo-700">{comparison.overallScore}%</strong><p className="text-xs" style={{ color: "var(--text-muted)" }}>documented skill overlap</p></div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full mt-4" role="progressbar" aria-label="Documented skill overlap" aria-valuemin={0} aria-valuemax={100} aria-valuenow={comparison.overallScore}>
              <div className="h-full rounded-full bg-indigo-600" style={{ width: `${comparison.overallScore}%` }} />
            </div>
          </SectionCard>

          <div className="grid md:grid-cols-2 gap-5">
            <SectionCard>
              <h2 className="font-semibold mb-3">Skills</h2>
              {comparison.skillMatches.length ? <ul className="space-y-2">{comparison.skillMatches.map((skill) => <li key={skill.skill} className="flex justify-between gap-3 text-sm"><span>{skill.skill}</span><span className={skill.status === "met" ? "text-green-700" : "text-amber-700"}>{skill.status === "met" ? "Documented" : "Gap"}</span></li>)}</ul> : <p className="text-sm text-slate-500">No skills listed by this opportunity.</p>}
            </SectionCard>
            <SectionCard>
              <h2 className="font-semibold mb-3">Requirements & eligibility</h2>
              {comparison.requirementItems.map((item) => <div key={item.requirement} className="py-2 border-b last:border-0"><div className="flex justify-between gap-2 text-sm"><span>{item.requirement}</span><strong className={item.status === "met" ? "text-green-700" : item.status === "gap" ? "text-amber-700" : "text-slate-500"}>{item.status}</strong></div><p className="text-xs mt-1 text-slate-500">{item.note}</p></div>)}
            </SectionCard>
          </div>

          <SectionCard>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div><h2 className="font-semibold">Preparation tasks</h2><p className="text-xs text-slate-500">Plan is refreshed from your profile and the selected listing.</p></div>
              {assessedId === opportunity.id && <span className="badge badge-success">Plan saved</span>}
            </div>
            {assessedId !== opportunity.id && <p className="text-sm text-slate-500">Select “Assess readiness” to create and save a task list for this opportunity.</p>}
            {assessedId === opportunity.id && tasks.length === 0 && <p className="text-sm text-green-700">No gaps or unknown fields were found in the available profile data. Verify official requirements before applying.</p>}
            {assessedId === opportunity.id && tasks.length > 0 && <ul className="space-y-3">{tasks.map((task) => <li key={task.id} className="flex gap-3 items-start"><input type="checkbox" checked={task.completed} aria-label={`Mark ${task.label} complete`} onChange={() => void patch({ toggleReadinessTask: task.id })} /><div className="flex-1"><p className={`text-sm font-medium ${task.completed ? "line-through text-slate-400" : ""}`}>{task.label}</p><p className="text-xs text-slate-500">{task.detail}</p>{task.resourceId && <Link href="/learn" className="text-xs text-indigo-700">Find a learning resource →</Link>}</div></li>)}</ul>}
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}
