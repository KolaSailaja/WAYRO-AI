"use client";

import Link from "next/link";
import { SkillBadge } from "@/components/ui";
import type { Opportunity } from "@/types";
import { daysUntil } from "@/lib/progress/calculate";

const TYPE_VARIANT: Record<string, "brand" | "success" | "warning" | "gray"> = {
  internship: "brand",
  job: "success",
  hackathon: "warning",
  scholarship: "brand",
  fellowship: "success",
  research: "gray",
  competition: "warning",
  course: "gray",
};

const TYPE_LABEL: Record<string, string> = {
  internship: "Internship",
  job: "Full-time",
  hackathon: "Hackathon",
  scholarship: "Scholarship",
  fellowship: "Fellowship",
  research: "Research",
  competition: "Competition",
  course: "Course / programme",
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  saved?: boolean;
  matchScore?: number;
  onToggleSave?: (id: string) => void;
}

export function OpportunityCard({
  opportunity,
  saved,
  matchScore,
  onToggleSave,
}: OpportunityCardProps) {
  const days = daysUntil(opportunity.deadline);

  return (
    <article
      className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
      aria-label={`${opportunity.title} at ${opportunity.organization}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <SkillBadge label={TYPE_LABEL[opportunity.type] ?? opportunity.type} variant={TYPE_VARIANT[opportunity.type] ?? "gray"} />
            {opportunity.isDemo && <SkillBadge label="Demo data" variant="warning" />}
            {typeof matchScore === "number" && (
              <SkillBadge label={`Match ${matchScore}% heuristic`} variant="brand" />
            )}
          </div>
          <h3 className="font-semibold text-base leading-snug" style={{ color: "var(--text-primary)" }}>
            <Link href={`/opportunities/${opportunity.id}`} className="hover:text-indigo-700">
              {opportunity.title}
            </Link>
          </h3>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {opportunity.organization}
            {opportunity.location ? ` · ${opportunity.location}` : ""}
            {opportunity.remote ? " · Remote possible" : ""}
          </p>
        </div>
      </div>

      <p className="text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
        {opportunity.description}
      </p>

      {opportunity.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {opportunity.skills.slice(0, 4).map((skill) => (
            <SkillBadge key={skill} label={skill} variant="gray" />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1 border-t flex-wrap" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs" style={{ color: days !== null && days <= 7 ? "var(--warning-700)" : "var(--text-muted)" }}>
          {days === null
            ? "No deadline listed"
            : days >= 0
              ? `${days} days left`
              : "Closed"}
        </span>
        <div className="flex gap-2">
          {onToggleSave && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              aria-pressed={saved}
              onClick={() => onToggleSave(opportunity.id)}
            >
              {saved ? "Saved" : "Save"}
            </button>
          )}
          <Link href={`/opportunities/${opportunity.id}`} className="btn btn-primary btn-sm">
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
