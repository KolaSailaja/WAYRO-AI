"use client";

import Link from "next/link";
import { useAppState } from "@/components/app/AppStateProvider";
import { EmptyState, PageHeading, SectionCard } from "@/components/ui";
import { calculateProgress } from "@/lib/progress/calculate";

export function ProgressWorkspace() {
  const { state, catalog } = useAppState();
  const progress = calculateProgress(state);
  const metrics = [
    ["Skills tracked", progress.skillsTracked],
    ["Learning tasks complete", progress.learningCompleted],
    ["Profile projects", state.profile.projects.length],
    ["Applications sent", progress.applicationsSent],
  ];

  return (
    <div className="animate-fadein max-w-5xl mx-auto">
      <PageHeading title="My Progress" subtitle="A record of profile, learning, application, and project activity." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {metrics.map(([label, value]) => <SectionCard key={String(label)}><p className="text-2xl font-bold text-indigo-700">{value}</p><p className="text-xs mt-1 text-slate-500">{label}</p></SectionCard>)}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <SectionCard>
          <h2 className="font-semibold mb-3">Applications</h2>
          {state.applications.length === 0 ? <EmptyState title="No applications tracked" description="Save an opportunity or set its status to start tracking progress." action={<Link href="/opportunities" className="btn btn-primary btn-sm">Browse opportunities</Link>} /> : <ul className="space-y-3">{state.applications.map((application) => {
            const opportunity = catalog.find((item) => item.id === application.opportunityId);
            return <li key={application.id} className="flex justify-between gap-3 text-sm"><Link className="text-indigo-700" href={`/opportunities/${application.opportunityId}`}>{opportunity?.title ?? application.opportunityId}</Link><span>{application.status.replace("_", " ")}</span></li>;
          })}</ul>}
        </SectionCard>
        <SectionCard>
          <h2 className="font-semibold mb-3">Learning activity</h2>
          {state.learningTasks.length === 0 ? <EmptyState title="No learning tasks yet" description="Add an item from the roadmap to track your progress." action={<Link href="/learn" className="btn btn-primary btn-sm">Explore learning resources</Link>} /> : <ul className="space-y-3">{state.learningTasks.map((task) => <li key={task.id} className="flex justify-between gap-3 text-sm"><span>{task.title}</span><span>{task.status.replace("_", " ")}</span></li>)}</ul>}
        </SectionCard>
        <SectionCard>
          <h2 className="font-semibold mb-3">Projects & proposals</h2>
          {state.profile.projects.length === 0 && state.proposals.length === 0 ? <EmptyState title="Nothing recorded yet" description="Add projects to your profile or draft an idea in Hackathon Lab." action={<Link href="/profile" className="btn btn-secondary btn-sm">Update profile</Link>} /> : <ul className="space-y-2 text-sm">{state.profile.projects.map((project) => <li key={project.id}>{project.title}</li>)}{state.proposals.map((proposal) => <li key={proposal.id}><Link className="text-indigo-700" href="/hackathon-lab">{proposal.title}</Link>{proposal.selected ? " · selected" : ""}</li>)}</ul>}
        </SectionCard>
        <SectionCard>
          <h2 className="font-semibold mb-3">Recent activity</h2>
          {state.activity.length === 0 ? <p className="text-sm text-slate-500">Actions you take in WAYRO appear here.</p> : <ol className="space-y-3">{state.activity.slice(0, 8).map((item) => <li key={item.id} className="text-sm"><p>{item.title}</p><time className="text-xs text-slate-500" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time></li>)}</ol>}
        </SectionCard>
      </div>
    </div>
  );
}
