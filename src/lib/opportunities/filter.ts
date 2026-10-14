import type { Opportunity, OpportunityType } from "@/types";

export type OpportunitySort = "relevance" | "deadline" | "newest";
export type OpportunityDeadlineFilter = "all" | "7days" | "30days" | "none";

export type OpportunityFilters = {
  query?: string;
  type?: OpportunityType | "all";
  skills?: string[];
  remote?: "all" | "remote" | "on-site";
  experience?: "all" | "beginner" | "intermediate" | "any";
  deadline?: OpportunityDeadlineFilter;
  location?: string;
  sort?: OpportunitySort;
  relevanceScores?: Record<string, number>;
  now?: number;
};

function textOf(opp: Opportunity): string {
  return [
    opp.title,
    opp.organization,
    opp.description,
    ...opp.skills,
    ...opp.requirements,
    ...opp.eligibility,
  ]
    .join(" ")
    .toLowerCase();
}

export function filterOpportunities(
  opportunities: Opportunity[],
  filters: OpportunityFilters = {}
): Opportunity[] {
  const query = filters.query?.trim().toLowerCase() ?? "";
  const type = filters.type ?? "all";
  const skills = filters.skills ?? [];
  const remote = filters.remote ?? "all";
  const experience = filters.experience ?? "all";
  const deadline = filters.deadline ?? "all";
  const location = filters.location?.trim().toLowerCase() ?? "";

  const filtered = opportunities.filter((opp) => {
    const matchesType = type === "all" || opp.type === type;
    const matchesQuery = query.length === 0 || textOf(opp).includes(query);
    const matchesSkills =
      skills.length === 0 || skills.every((skill) => opp.skills.includes(skill));
    const matchesRemote =
      remote === "all" ||
      (remote === "remote" && opp.remote) ||
      (remote === "on-site" && !opp.remote);
    const matchesExperience =
      experience === "all" ||
      !opp.experience ||
      opp.experience === "any" ||
      opp.experience === experience;
    const daysLeft = opp.deadline
      ? Math.ceil((new Date(opp.deadline).getTime() - (filters.now ?? Date.now())) / 86400000)
      : null;
    const matchesDeadline =
      deadline === "all" ||
      (deadline === "none" && daysLeft === null) ||
      (deadline === "7days" && daysLeft !== null && daysLeft >= 0 && daysLeft <= 7) ||
      (deadline === "30days" && daysLeft !== null && daysLeft >= 0 && daysLeft <= 30);
    const matchesLocation =
      location.length === 0 || (opp.location ?? "").toLowerCase().includes(location);
    return (
      matchesType &&
      matchesQuery &&
      matchesSkills &&
      matchesRemote &&
      matchesExperience &&
      matchesDeadline &&
      matchesLocation
    );
  });

  const sort = filters.sort ?? "deadline";
  const scores = filters.relevanceScores ?? {};

  return [...filtered].sort((a, b) => {
    if (sort === "relevance") {
      return (scores[b.id] ?? 0) - (scores[a.id] ?? 0);
    }
    if (sort === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    const ad = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
    const bd = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
    return ad - bd;
  });
}
