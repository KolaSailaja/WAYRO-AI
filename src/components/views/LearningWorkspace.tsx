"use client";

import Link from "next/link";
import { useAppState } from "@/components/app/AppStateProvider";
import { PageHeading, SectionCard } from "@/components/ui";
import { LEARNING_CATALOG } from "@/lib/catalog/learning";
import type { LearningTaskStatus } from "@/types";

const TASK_STATES: LearningTaskStatus[] = ["not_started", "in_progress", "completed"];

export function LearningWorkspace() {
  const { state, patch, error } = useAppState();
  const suggested = new Set(state.readinessTasks.filter((task) => !task.completed && task.skill).map((task) => task.skill!.toLowerCase()));

  return (
    <div className="animate-fadein max-w-5xl mx-auto">
      <PageHeading title="Learning Roadmap" subtitle="Choose a public learning resource and track the work you do." action={<Link href="/profile" className="btn btn-secondary btn-sm">Edit skills</Link>} />
      <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>Demo catalogue links are examples. Confirm provider details and pricing at the source; WAYRO AI does not award third-party certificates.</p>
      {error && <p role="alert" className="card p-3 mb-4 text-sm text-red-700">{error}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {LEARNING_CATALOG.map((resource) => {
          const task = state.learningTasks.find((item) => item.resourceId === resource.id);
          const skill = resource.skills[0] ?? "General";
          const isSuggested = resource.skills.some((item) => suggested.has(item.toLowerCase()));
          return (
            <SectionCard key={resource.id}>
              <div className="flex justify-between items-start gap-3">
                <div><span className="badge badge-gray">{resource.type}</span>{isSuggested && <span className="badge badge-brand ml-2">Readiness gap</span>}
                  <h2 className="font-semibold mt-2">{resource.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{resource.provider} · {resource.durationHours ? `${resource.durationHours}h estimate` : "Effort varies"} · {resource.isFree ? "Free" : "Check pricing"}</p>
                </div>
                <span className="badge badge-warning">Example</span>
              </div>
              <p className="text-sm mt-3">{resource.notes}</p>
              <p className="text-xs mt-2 text-slate-500">Skills: {resource.skills.join(", ")}</p>
              <div className="flex items-center justify-between gap-3 mt-4">
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-700">Open resource ↗</a>
                <label className="text-sm flex items-center gap-2">
                  <span className="sr-only">Progress for {resource.title}</span>
                  <select
                    className="input"
                    aria-label={`Progress for ${resource.title}`}
                    value={task?.status ?? "not_started"}
                    onChange={(event) => void patch({ learningTask: { id: task?.id ?? `learning-${resource.id}`, resourceId: resource.id, skill, title: resource.title, status: event.target.value } })}
                  >
                    {TASK_STATES.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
                  </select>
                </label>
              </div>
            </SectionCard>
          );
        })}
      </div>
      <SectionCard className="mt-5">
        <h2 className="font-semibold mb-2">Your tracked tasks</h2>
        {state.learningTasks.length === 0 ? <p className="text-sm text-slate-500">No tasks yet. Choose a resource status above to add it to your roadmap.</p> : (
          <ul className="space-y-2">{state.learningTasks.map((task) => <li key={task.id} className="flex justify-between text-sm"><span>{task.title} · {task.skill}</span><span className={task.status === "completed" ? "text-green-700" : "text-slate-500"}>{task.status.replace("_", " ")}</span></li>)}</ul>
        )}
      </SectionCard>
    </div>
  );
}
