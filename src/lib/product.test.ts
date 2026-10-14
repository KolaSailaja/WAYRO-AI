import { describe, expect, it } from "vitest";
import { OPPORTUNITY_CATALOG } from "@/lib/catalog/opportunities";
import { defaultState, emptyProfile } from "@/lib/store/defaults";
import { matchOpportunity } from "@/lib/matching/score";
import { filterOpportunities } from "@/lib/opportunities/filter";
import { compareReadiness } from "@/lib/readiness/compare";
import { calculateProgress } from "@/lib/progress/calculate";
import { evaluateTrust } from "@/lib/trust/flags";
import { generateProposals } from "@/lib/hackathon/generate";
import { parseEnv } from "@/lib/env";
import { parseProfile } from "@/lib/profile/schema";

describe("student opportunity workflows", () => {
  it("keeps heuristic scores within their documented range", () => {
    const profile = emptyProfile();
    const result = matchOpportunity(profile, OPPORTUNITY_CATALOG[0]);
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
    expect(result.isHeuristic).toBe(true);
    expect(result.unknownEligibility.length).toBeGreaterThan(0);
  });

  it("treats undocumented eligibility as unknown instead of ineligible", () => {
    const result = compareReadiness(emptyProfile(), OPPORTUNITY_CATALOG[2]);
    expect(result.requirementItems.some((item) => item.status === "unknown")).toBe(true);
    expect(result.unknownFields).toContain("education");
  });

  it("combines opportunity search, type, skills, and remote filters", () => {
    const results = filterOpportunities(OPPORTUNITY_CATALOG, {
      query: "intern",
      type: "internship",
      skills: ["Python"],
      remote: "remote",
      location: "Bengaluru",
      deadline: "30days",
      now: Date.now(),
    });
    expect(results.map((item) => item.id)).toContain("demo-1");
    expect(results.every((item) => item.type === "internship" && item.remote)).toBe(true);
  });

  it("calculates progress from saved student actions", () => {
    const state = defaultState();
    state.profile.skills.push({ id: "python", name: "Python", category: "engineering", level: "beginner" });
    state.learningTasks.push({
      id: "task-1",
      skill: "Python",
      title: "Intro to Python",
      status: "completed",
      updatedAt: new Date().toISOString(),
    });
    state.applications.push({
      id: "app-1",
      opportunityId: "demo-1",
      status: "applied",
      notes: "",
      updatedAt: new Date().toISOString(),
    });
    const result = calculateProgress(state);
    expect(result.skillsTracked).toBe(1);
    expect(result.learningCompleted).toBe(1);
    expect(result.applicationsSent).toBe(1);
  });

  it("labels trust checks as heuristics and never claims URL verification", () => {
    const result = evaluateTrust(OPPORTUNITY_CATALOG[0]);
    expect(result.didVerifyUrl).toBe(false);
    expect(result.flags.some((flag) => flag.id === "demo")).toBe(true);
    expect(result.summary).toContain("URL reachability was not checked");
  });

  it("creates clearly preliminary proposals without claiming research", () => {
    const proposals = generateProposals({
      challengeName: "Student challenge",
      domain: "Climate",
      projectType: "software",
      theme: "Community resilience",
      teamSize: "3",
      devHours: "36",
      skills: "React, Python",
      budget: "0",
      constraints: "No paid APIs",
      goals: "Working demo",
    }, {
      query: "climate community",
      status: "unavailable",
      detail: "No research provider configured.",
    });
    expect(proposals).toHaveLength(3);
    expect(proposals.every((proposal) => proposal.isPreliminary && !proposal.researchAvailable)).toBe(true);
    expect(proposals.every((proposal) => proposal.hypothesisGaps.length > 0)).toBe(true);
  });

  it("validates profiles and never echoes secret environment values", () => {
    const profile = emptyProfile();
    profile.name = "Test Student";
    expect(parseProfile(profile).success).toBe(true);
    expect(parseEnv({ AI_PROVIDER: "mock" }).AI_PROVIDER).toBe("mock");
    expect(() => parseEnv({ AUTH_SECRET: "not-a-valid-secret" })).toThrow(/AUTH_SECRET must be at least 32 characters/);
  });
});
