import type { Opportunity, Skill, StudentProfile } from "@/types";
import { findResourcesForSkill } from "@/lib/catalog/learning";

export type ReadinessMatchStatus = "met" | "gap" | "unknown";

export interface SkillComparison {
  skill: string;
  status: Extract<ReadinessMatchStatus, "met" | "gap">;
  resourceId?: string;
}

export interface RequirementComparison {
  requirement: string;
  status: ReadinessMatchStatus;
  note: string;
}

export interface ReadinessComparison {
  overallScore: number;
  skillMatches: SkillComparison[];
  requirementItems: RequirementComparison[];
  unknownFields: string[];
}

type ReadinessProfile = { skills: Array<Skill | string> } &
  Partial<Pick<StudentProfile, "institution" | "graduationYear" | "bio" | "projects">>;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function compareReadiness(
  profile: ReadinessProfile,
  opportunity: Pick<Opportunity, "skills" | "requirements" | "eligibility">
): ReadinessComparison {
  const skillList = profile.skills.map((skill: Skill | string) =>
    typeof skill === "string" ? skill : skill.name
  );

  const documented = new Set(skillList.map(normalize).filter(Boolean));
  const hasProfileSkills = documented.size > 0;
  const hasEducation = Boolean(profile.institution || profile.graduationYear);

  const skillMatches: SkillComparison[] = opportunity.skills.map((skill) => {
    const resource = findResourcesForSkill(skill)[0];
    return {
      skill,
      status: documented.has(normalize(skill)) ? "met" : "gap",
      resourceId: resource?.id,
    };
  });

  const requirementItems: RequirementComparison[] = [
    ...opportunity.requirements,
    ...opportunity.eligibility,
  ].map((requirement) => {
    const reqNorm = normalize(requirement);
    if (reqNorm.includes("gpa") && !`${profile.bio ?? ""}`.toLowerCase().includes("gpa")) {
      return {
        requirement,
        status: "unknown" as const,
        note: "GPA is not documented. Unknown is not the same as ineligible.",
      };
    }
    if ((reqNorm.includes("enroll") || reqNorm.includes("student") || reqNorm.includes("undergraduate")) && !hasEducation) {
      return {
        requirement,
        status: "unknown" as const,
        note: "Education details are missing, so eligibility cannot be confirmed.",
      };
    }
    if (!hasProfileSkills) {
      return {
        requirement,
        status: "unknown" as const,
        note: "Add skills to compare this requirement against your profile.",
      };
    }
    const matchedSkill = [...documented].find((skill) => reqNorm.includes(skill));
    if (matchedSkill) {
      return {
        requirement,
        status: "met",
        note: `Related documented skill: ${matchedSkill}`,
      };
    }
    return {
      requirement,
      status: "gap",
      note: "No documented skill clearly covers this. Verify manually before assuming a gap.",
    };
  });

  const unknownFields: string[] = [];
  if (!hasEducation) unknownFields.push("education");
  if (!hasProfileSkills) unknownFields.push("skills");
  if (profile.projects && profile.projects.length === 0) unknownFields.push("projects");

  const scored = skillMatches.length;
  const met = skillMatches.filter((item) => item.status === "met").length;
  const overallScore = scored === 0 ? 0 : Math.round((met / scored) * 100);

  return { overallScore, skillMatches, requirementItems, unknownFields };
}

export function compareReadinessFromSkillNames(
  studentSkills: string[],
  opportunity: Pick<Opportunity, "skills" | "requirements">
): ReadinessComparison {
  return compareReadiness(
    {
      skills: studentSkills,
      institution: "x",
      graduationYear: 2026,
    },
    { ...opportunity, eligibility: [] }
  );
}
