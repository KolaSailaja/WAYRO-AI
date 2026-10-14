"use client";

import { useMemo, useState } from "react";
import { PageHeading, SkillBadge, DemoNotice, EmptyState } from "@/components/ui";
import { OpportunityCard } from "@/components/ui/OpportunityCard";
import { useAppState } from "@/components/app/AppStateProvider";
import { filterOpportunities, type OpportunityDeadlineFilter, type OpportunitySort } from "@/lib/opportunities/filter";
import { rankOpportunities } from "@/lib/matching/score";
import type { OpportunityType } from "@/types";

const ALL_TYPES: { value: OpportunityType | "all"; label: string }[] = [
  { value: "all",         label: "All types" },
  { value: "internship",  label: "Internships" },
  { value: "job",         label: "Jobs" },
  { value: "hackathon",   label: "Hackathons" },
  { value: "scholarship", label: "Scholarships" },
  { value: "fellowship",  label: "Fellowships" },
  { value: "research",    label: "Research" },
  { value: "competition", label: "Competitions" },
  { value: "course",      label: "Courses" },
];

export default function OpportunitiesPage() {
  const { state, catalog, patch, error } = useAppState();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<OpportunityType | "all">("all");
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [remote, setRemote] = useState<"all" | "remote" | "on-site">("all");
  const [experience, setExperience] = useState<"all" | "beginner" | "intermediate" | "any">("all");
  const [deadline, setDeadline] = useState<OpportunityDeadlineFilter>("all");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState<OpportunitySort>("deadline");
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
  const allSkills = useMemo(() => Array.from(new Set(catalog.flatMap((item) => item.skills))).sort(), [catalog]);
  const relevanceScores = useMemo(
    () => Object.fromEntries(rankOpportunities(state.profile, catalog).map(({ opportunity, match }) => [opportunity.id, match.overall])),
    [catalog, state.profile]
  );

  const filtered = filterOpportunities(catalog, {
    query,
    type: typeFilter,
    skills: skillFilter,
    remote,
    experience,
    deadline,
    location,
    sort,
    relevanceScores,
  });

  function toggleSkill(skill: string) {
    setSkillFilter((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  return (
    <div className="animate-fadein max-w-screen-xl mx-auto">
      <PageHeading
        title="Opportunities"
        subtitle="Discover internships, hackathons, scholarships, and more"
      />

      <DemoNotice message="Listings are explicitly marked demonstration examples, not verified openings. No live opportunity provider is configured." />
      {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Filters sidebar ───────────────────────────────────────────── */}
        <aside className="flex-shrink-0 lg:w-56" aria-label="Filters">
          {/* Search */}
          <div className="card p-4 mb-4">
            <label htmlFor="opp-search" className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: "var(--text-muted)" }}>
              Search
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                id="opp-search"
                type="search"
                className="input pl-9"
                placeholder="Title or organization…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search opportunities"
              />
            </div>
          </div>

          {/* Type filter */}
          <div className="card p-4 mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>
              Opportunity type
            </p>
            <div className="space-y-1">
              {ALL_TYPES.map((t) => (
                <button
                  key={t.value}
                  id={`type-filter-${t.value}`}
                  onClick={() => setTypeFilter(t.value)}
                  aria-pressed={typeFilter === t.value}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    typeFilter === t.value
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skills filter */}
          <div className="card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>
              Required skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allSkills.map((skill) => (
                <button
                  key={skill}
                  id={`skill-filter-${skill.replace(/\s+/g, "-").toLowerCase()}`}
                  onClick={() => toggleSkill(skill)}
                  aria-pressed={skillFilter.includes(skill)}
                  className="focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full"
                >
                  <SkillBadge
                    label={skill}
                    variant={skillFilter.includes(skill) ? "brand" : "gray"}
                  />
                </button>
              ))}
            </div>
            {skillFilter.length > 0 && (
              <button
                onClick={() => setSkillFilter([])}
                className="text-xs mt-3 underline"
                style={{ color: "var(--text-muted)" }}
              >
                Clear skill filters
              </button>
            )}
          </div>
          <div className="card p-4 mt-4">
            <label htmlFor="remote-filter" className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: "var(--text-muted)" }}>Work mode</label>
            <select id="remote-filter" className="input" value={remote} onChange={(event) => setRemote(event.target.value as typeof remote)}>
              <option value="all">Any</option>
              <option value="remote">Remote</option>
              <option value="on-site">On-site</option>
            </select>
          </div>
          <div className="card p-4 mt-4">
            <label htmlFor="experience-filter" className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: "var(--text-muted)" }}>Experience</label>
            <select id="experience-filter" className="input" value={experience} onChange={(event) => setExperience(event.target.value as typeof experience)}>
              <option value="all">Any level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="any">Open to any experience</option>
            </select>
          </div>
          <div className="card p-4 mt-4">
            <label htmlFor="deadline-filter" className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: "var(--text-muted)" }}>Deadline</label>
            <select id="deadline-filter" className="input" value={deadline} onChange={(event) => setDeadline(event.target.value as OpportunityDeadlineFilter)}>
              <option value="all">Any deadline</option>
              <option value="7days">Within 7 days</option>
              <option value="30days">Within 30 days</option>
              <option value="none">No deadline listed</option>
            </select>
          </div>
          <div className="card p-4 mt-4">
            <label htmlFor="location-filter" className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: "var(--text-muted)" }}>Location</label>
            <input id="location-filter" className="input" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City or region" />
          </div>
        </aside>

        {/* ── Results ───────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </p>
            <label className="text-sm flex items-center gap-2">
              <span style={{ color: "var(--text-muted)" }}>Sort by</span>
              <select className="input" value={sort} onChange={(event) => setSort(event.target.value as OpportunitySort)} aria-label="Sort opportunities">
                <option value="relevance" disabled={!hasProfileSignals}>Profile match</option>
                <option value="deadline">Deadline</option>
                <option value="newest">Recently added</option>
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
              }
              title="No opportunities match your filters"
              description="Try adjusting your search or filters. Real opportunities will appear here once a data source is connected."
              action={
                <button onClick={() => { setQuery(""); setTypeFilter("all"); setSkillFilter([]); setRemote("all"); setExperience("all"); setDeadline("all"); setLocation(""); }} className="btn btn-secondary btn-sm">
                  Clear all filters
                </button>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-1 xl:grid-cols-2 gap-4">
              {filtered.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  saved={state.savedIds.includes(opp.id)}
                  matchScore={hasProfileSignals ? relevanceScores[opp.id] : undefined}
                  onToggleSave={(id) => void patch({ toggleSave: id })}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
