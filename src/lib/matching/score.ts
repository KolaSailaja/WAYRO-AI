import type { Opportunity, StudentProfile } from "@/types";

export interface MatchBreakdown {
  key: string;
  label: string;
  weight: number;
  score: number;
  note: string;
}

export interface MatchResult {
  opportunityId: string;
  overall: number;
  method: string;
  strengths: string[];
  missingSkills: string[];
  unknownEligibility: string[];
  disqualifiers: string[];
  actions: string[];
  breakdown: MatchBreakdown[];
  isHeuristic: true;
}

const METHOD =
  "Approximate heuristic: skills 40%, preferred type 15%, interests 15%, education documented 10%, goals keywords 10%, deadline window 10%. Missing profile fields are treated as unknown, not automatic disqualification.";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function skillNames(profile: StudentProfile): string[] {
  return profile.skills.map((s) => normalize(s.name)).filter(Boolean);
}

function overlap(a: string[], b: string[]): string[] {
  const set = new Set(a.map(normalize));
  return b.filter((item) => set.has(normalize(item)));
}

export function matchOpportunity(
  profile: StudentProfile,
  opportunity: Opportunity,
  now = Date.now()
): MatchResult {
  const skills = skillNames(profile);
  const matchedSkills = overlap(skills, opportunity.skills);
  const missingSkills = opportunity.skills.filter(
    (skill) => !matchedSkills.some((m) => normalize(m) === normalize(skill))
  );

  const skillScore =
    opportunity.skills.length === 0
      ? 0
      : Math.round((matchedSkills.length / opportunity.skills.length) * 100);

  const typeScore =
    profile.preferredTypes.length === 0
      ? 50
      : profile.preferredTypes.includes(opportunity.type)
        ? 100
        : 20;

  const interestHaystack = [
    ...profile.interests,
    profile.goals,
    profile.fieldOfStudy,
    profile.targetRoles,
  ]
    .join(" ")
    .toLowerCase();
  const interestHits = [opportunity.type, opportunity.title, ...opportunity.skills].filter((token) =>
    interestHaystack.includes(normalize(token))
  );
  const interestScore =
    profile.interests.length === 0 && !profile.goals.trim()
      ? 40
      : Math.min(100, 30 + interestHits.length * 20);

  const educationScore = profile.institution.trim() || profile.graduationYear ? 100 : 0;

  const goalText = `${profile.goals} ${profile.targetRoles}`.toLowerCase();
  const goalHits = opportunity.skills.filter((skill) => goalText.includes(normalize(skill)));
  const goalScore = !profile.goals.trim() && !profile.targetRoles.trim() ? 40 : Math.min(100, goalHits.length * 35 + 20);

  let deadlineScore = 70;
  let deadlineNote = "No deadline listed.";
  if (opportunity.deadline) {
    const days = Math.ceil((new Date(opportunity.deadline).getTime() - now) / (86400000));
    const hours = profile.weeklyHours ?? 0;
    if (days < 0) {
      deadlineScore = 0;
      deadlineNote = "Listed deadline has passed on this demonstration record.";
    } else if (days <= 7 && hours > 0 && hours < 5) {
      deadlineScore = 35;
      deadlineNote = "Short window relative to documented weekly hours.";
    } else if (days <= 7) {
      deadlineScore = 55;
      deadlineNote = "Deadline is within 7 days.";
    } else {
      deadlineScore = 90;
      deadlineNote = `${days} days remaining on the demonstration deadline.`;
    }
  }

  const breakdown: MatchBreakdown[] = [
    { key: "skills", label: "Skills overlap", weight: 0.4, score: skillScore, note: `${matchedSkills.length}/${opportunity.skills.length} listed skills documented.` },
    { key: "type", label: "Opportunity type preference", weight: 0.15, score: typeScore, note: profile.preferredTypes.length ? "Compared with preferred types." : "No preferred types set — neutral score." },
    { key: "interests", label: "Interests and domain", weight: 0.15, score: interestScore, note: "Keyword overlap with interests, goals, and field of study." },
    { key: "education", label: "Education documented", weight: 0.1, score: educationScore, note: educationScore ? "Institution or graduation year present." : "Education details unknown." },
    { key: "goals", label: "Career goals keywords", weight: 0.1, score: goalScore, note: "Not a validated prediction." },
    { key: "deadline", label: "Preparation window", weight: 0.1, score: deadlineScore, note: deadlineNote },
  ];

  const overall = Math.round(
    breakdown.reduce((sum, item) => sum + item.score * item.weight, 0)
  );

  const unknownEligibility: string[] = [];
  const disqualifiers: string[] = [];
  for (const rule of opportunity.eligibility) {
    const lower = rule.toLowerCase();
    if (lower.includes("gpa") && !profile.bio.toLowerCase().includes("gpa")) {
      unknownEligibility.push(rule);
    } else if (lower.includes("student") && !profile.institution && !profile.graduationYear) {
      unknownEligibility.push(rule);
    } else if (lower.includes("authorized to work")) {
      unknownEligibility.push(rule);
    }
  }

  const strengths: string[] = [];
  if (matchedSkills.length) strengths.push(`Documented skills: ${matchedSkills.join(", ")}`);
  if (profile.preferredTypes.includes(opportunity.type)) {
    strengths.push(`Matches preferred type (${opportunity.type}).`);
  }
  if (profile.projects.length) strengths.push(`${profile.projects.length} project(s) on profile.`);

  const actions: string[] = [];
  for (const skill of missingSkills.slice(0, 4)) {
    actions.push(`Practise ${skill} and add evidence to your profile.`);
  }
  if (!profile.institution) actions.push("Add education details so eligibility can be compared.");
  if (!profile.portfolioUrl && !profile.githubUrl) {
    actions.push("Add a portfolio or GitHub link if the listing asks for evidence.");
  }

  return {
    opportunityId: opportunity.id,
    overall,
    method: METHOD,
    strengths,
    missingSkills,
    unknownEligibility,
    disqualifiers,
    actions,
    breakdown,
    isHeuristic: true,
  };
}

export function rankOpportunities(profile: StudentProfile, opportunities: Opportunity[]): Array<{ opportunity: Opportunity; match: MatchResult }> {
  return opportunities
    .map((opportunity) => ({ opportunity, match: matchOpportunity(profile, opportunity) }))
    .sort((a, b) => b.match.overall - a.match.overall);
}
