"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppState } from "@/components/app/AppStateProvider";
import { OpportunityCard } from "@/components/ui/OpportunityCard";
import { DemoNotice, EmptyState, PageHeading, SectionCard } from "@/components/ui";
import { rankOpportunities } from "@/lib/matching/score";
import { calculateProgress } from "@/lib/progress/calculate";

export function DashboardView() {
  const { state, catalog, reminders, loading, error, patch, refresh } = useAppState();
  const progress = useMemo(() => calculateProgress(state), [state]);
  const hasProfileSignals = Boolean(
    state.profile.skills.length ||
    state.profile.institution ||
    state.profile.graduationYear ||
    state.profile.fieldOfStudy ||
    state.profile.interests.length ||
    state.profile.goals.trim() ||
    state.profile.targetRoles.trim() ||
    state.profile.preferredTypes.length ||
    state.profile.projects.length
  );
  const recommendations = useMemo(
    () => rankOpportunities(state.profile, catalog).slice(0, 3),
    [catalog, state.profile]
  );

  if (loading) {
    return <p role="status" className="py-12 text-center text-sm">Loading your dashboard…</p>;
  }

  return (
    <div className="animate-fadein max-w-screen-xl mx-auto">
      <PageHeading
        title={`Welcome${state.profile.name ? `, ${state.profile.name}` : ""}`}
        subtitle="Your path from opportunity to achievement starts here."
        action={<Link href="/profile" className="btn btn-secondary btn-sm">Edit profile</Link>}
      />

      {error && (
        <div role="alert" className="card p-4 mb-5 flex items-center justify-between gap-3">
          <span className="text-sm text-red-700">{error}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => void refresh()}>Retry</button>
        </div>
      )}
      <DemoNotice message={`Your data uses ${state.persistence.label} Opportunity recommendations are approximate heuristics; all current opportunity listings are labelled demonstration data.`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          ["Saved opportunities", progress.savedCount, "/opportunities"],
          ["Applications sent", progress.applicationsSent, "/progress"],
          ["Skills tracked", progress.skillsTracked, "/profile"],
          ["Learning completed", progress.learningCompleted, "/learn"],
        ].map(([label, value, href]) => (
          <Link key={String(label)} href={String(href)} className="card p-4 hover:shadow-md transition-shadow">
            <p className="text-2xl font-bold" style={{ color: "var(--brand-600)" }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{hasProfileSignals ? "Recommended for you" : "Example opportunities to explore"}</h3>
            <Link href="/opportunities" className="text-sm text-indigo-700">Explore all</Link>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            {hasProfileSignals ? "Ranked using profile overlap only—not an eligibility or success prediction." : "Add profile details to calculate approximate matches. These examples are not ranked by personal fit."}
          </p>
          {recommendations.length ? (
            <div className="grid xl:grid-cols-2 gap-4">
              {recommendations.map(({ opportunity, match }) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  saved={state.savedIds.includes(opportunity.id)}
                  matchScore={hasProfileSignals ? match.overall : undefined}
                  onToggleSave={(id) => void patch({ toggleSave: id })}
                />
              ))}
            </div>
          ) : (
            <SectionCard>
              <EmptyState title="No recommendations yet" description="Add skills and interests to your profile to get a more useful heuristic ranking." action={<Link className="btn btn-primary btn-sm" href="/profile">Complete profile</Link>} />
            </SectionCard>
          )}
        </section>

        <aside className="space-y-5">
          <SectionCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Profile readiness</h3>
              <span className="text-sm font-bold text-indigo-700">{progress.profileCompletion}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 mb-3" role="progressbar" aria-label="Profile completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.profileCompletion}>
              <div className="h-full rounded-full bg-indigo-600" style={{ width: `${progress.profileCompletion}%` }} />
            </div>
            <Link href="/profile" className="text-sm text-indigo-700">Improve your profile →</Link>
          </SectionCard>

          <SectionCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Upcoming deadlines</h3>
              <Link href="/settings" className="text-xs text-indigo-700">Preferences</Link>
            </div>
            {!state.settings.inAppRemindersEnabled || reminders.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {!state.settings.inAppRemindersEnabled ? "In-app reminders are turned off." : "No upcoming reminders from saved opportunities."}
              </p>
            ) : (
              <ul className="space-y-3">
                {reminders.slice(0, 4).map((item) => (
                  <li key={item.opportunityId}>
                    <Link href={`/opportunities/${item.opportunityId}`} className="text-sm font-medium text-indigo-700">{item.title}</Link>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.daysLeft} days left</p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard>
            <h3 className="font-semibold text-sm mb-3">Next steps</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link className="text-indigo-700" href="/readiness">Assess opportunity readiness →</Link>
              <Link className="text-indigo-700" href="/learn">Build a learning roadmap →</Link>
              <Link className="text-indigo-700" href="/hackathon-lab">Develop a project proposal →</Link>
              <Link className="text-indigo-700" href="/journey">Explore your journey →</Link>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-semibold text-sm">Application progress</h3>
              <Link href="/progress" className="text-xs text-indigo-700">View all</Link>
            </div>
            {state.applications.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No applications tracked. Set a status on any opportunity to begin.</p>
            ) : (
              <ul className="space-y-3">
                {state.applications.slice(0, 4).map((application) => {
                  const item = catalog.find((opportunity) => opportunity.id === application.opportunityId);
                  return (
                    <li key={application.id} className="flex items-center justify-between gap-3 text-sm">
                      <Link href={`/opportunities/${application.opportunityId}`} className="truncate text-indigo-700">{item?.title ?? application.opportunityId}</Link>
                      <span className="badge badge-gray">{application.status}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          <SectionCard>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-semibold text-sm">Recent activity</h3>
              <Link href="/progress" className="text-xs text-indigo-700">Timeline</Link>
            </div>
            {state.activity.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Your saved changes and learning milestones will appear here.</p>
            ) : (
              <ul className="space-y-2">
                {state.activity.slice(0, 4).map((item) => (
                  <li key={item.id} className="text-sm">
                    {item.href ? <Link href={item.href} className="text-indigo-700">{item.title}</Link> : item.title}
                    <time className="block text-xs text-slate-500" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString("en-GB", { timeZone: "UTC" })}</time>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {state.profile.skills.length > 0 && (
            <SectionCard>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm">Skills in your profile</h3>
                <Link href="/profile" className="text-xs text-indigo-700">Edit</Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {state.profile.skills.slice(0, 8).map((skill) => <span key={skill.id} className="badge badge-brand">{skill.name} · {skill.level}</span>)}
              </div>
            </SectionCard>
          )}
        </aside>
      </div>
    </div>
  );
}
