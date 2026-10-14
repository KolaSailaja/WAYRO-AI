import type { HackathonProposal } from "@/types";

export interface HackathonInput {
  challengeName: string;
  domain: string;
  projectType: string;
  theme: string;
  teamSize: string;
  devHours: string;
  skills: string;
  budget: string;
  constraints: string;
  goals: string;
}

export interface ResearchNote {
  query: string;
  status: "unavailable" | "preliminary";
  detail: string;
}

function clampHours(raw: string): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 48;
}

function id(): string {
  return `proposal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Deterministic proposal drafting. Does not invent papers, URLs, or citations.
 */
export function generateProposals(
  input: HackathonInput,
  research: ResearchNote
): HackathonProposal[] {
  const hours = clampHours(input.devHours);
  const softwareOnly = input.projectType === "software" || input.projectType === "data" || input.projectType === "design";
  const hardware = input.projectType === "hardware" || input.projectType === "hybrid";
  const domain = input.domain.trim() || "the stated domain";
  const now = new Date().toISOString();

  const commonLimitations =
    research.status === "unavailable"
      ? "No live web-research provider is configured. Treat gaps as hypotheses until you review primary sources."
      : "Research notes are preliminary brainstorming, not a literature review.";

  const candidates: Array<Omit<HackathonProposal, "id" | "createdAt" | "updatedAt" | "selected">> = [
    {
      title: `Accessible ${domain} companion`,
      domain,
      challengeName: input.challengeName,
      projectType: input.projectType || "software",
      theme: input.theme,
      teamSize: input.teamSize,
      devHours: input.devHours,
      skills: input.skills,
      budget: input.budget,
      constraints: input.constraints,
      goals: input.goals,
      problem: `People interacting with ${domain} often lack a clear, low-friction way to complete a high-stakes task under time pressure.`,
      targetUsers: "Students or residents who must complete the task with limited guidance.",
      existingApproaches: "Generic apps, spreadsheets, and manual processes exist in most domains. Specific competitors were not verified in this run.",
      evidenceNotes: research.detail,
      gaps: [],
      hypothesisGaps: [
        "Existing tools may be hard to use for first-time users — needs user interviews.",
        "Offline or low-bandwidth use may be underserved — needs field checks.",
      ],
      proposedInnovation: "A narrowly scoped assistant that walks a first-time user through one critical workflow, with an offline-friendly MVP.",
      whyBetter: "Better is not claimed as proven. The bet is faster time-to-complete for a single workflow, which you can measure in a demo.",
      architecture: softwareOnly
        ? "Client web app + optional mock API. No unpaid third-party dependency in the MVP."
        : "Software dashboard plus one optional hardware/sensor input if the team already has the device.",
      technologies: input.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 6),
      mvpScope: hours < 24 ? "Single-screen demo + scripted walkthrough." : "Core workflow, one dataset or mock feed, and a 3-minute demo script.",
      feasibility: hours >= 24 && !hardware
        ? "Software-only MVP is more feasible in a typical hackathon window."
        : hardware
          ? "Hardware/hybrid work is higher risk unless the team already has devices and test access."
          : "Tight timebox — keep the demo scripted.",
      risks: [
        "Scope creep beyond one workflow",
        hardware ? "Hardware access and debugging time" : "Unreliable external APIs",
        "No primary research yet",
      ],
      evaluationMetrics: ["Time to complete the demo task", "Judge-comprehensible before/after story", "Works without paid APIs"],
      demoStrategy: "Show a before state, complete the workflow live or via a short recording, and list what was not validated.",
      limitations: commonLimitations,
      scores: {
        impact: 4,
        noveltyPotential: 3,
        feasibility: softwareOnly ? 5 : 3,
        differentiation: 3,
        demonstrability: hours >= 24 ? 5 : 3,
      },
      isPreliminary: true,
      researchAvailable: false,
    },
    {
      title: `${domain} transparency board`,
      domain,
      challengeName: input.challengeName,
      projectType: input.projectType || "software",
      theme: input.theme,
      teamSize: input.teamSize,
      devHours: input.devHours,
      skills: input.skills,
      budget: input.budget,
      constraints: input.constraints,
      goals: input.goals,
      problem: `Stakeholders in ${domain} cannot see status, bottlenecks, or next actions in one place.`,
      targetUsers: "Operators, volunteers, or students coordinating a shared process.",
      existingApproaches: "Chat groups and generic kanban tools. No competitor audit was performed in this run.",
      evidenceNotes: research.detail,
      gaps: [],
      hypothesisGaps: [
        "Shared visibility may be poor across roles — needs observation.",
        "Official dashboards may exist but be closed or expensive — needs source checks.",
      ],
      proposedInnovation: "A lightweight status board tailored to one process, using open or mock data only.",
      whyBetter: "Differentiation is a hypothesis: domain-specific language and a single metric that generic tools bury.",
      architecture: "Static or Next.js board + JSON mock data. Optional live feed later.",
      technologies: ["Next.js", "TypeScript", ...input.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3)],
      mvpScope: "One board, one persona, three status cards, export/screenshot for judges.",
      feasibility: "Usually feasible in software-only tracks.",
      risks: ["Fake data mistaken for live data", "Unclear metric"],
      evaluationMetrics: ["Can a new viewer explain the bottleneck in 30 seconds", "Data sources labelled"],
      demoStrategy: "Walk a judge from a messy chat transcript to the board.",
      limitations: commonLimitations,
      scores: {
        impact: 3,
        noveltyPotential: 2,
        feasibility: 5,
        differentiation: 2,
        demonstrability: 5,
      },
      isPreliminary: true,
      researchAvailable: false,
    },
    {
      title: `Evidence-first ${domain} checklist`,
      domain,
      challengeName: input.challengeName,
      projectType: input.projectType || "software",
      theme: input.theme,
      teamSize: input.teamSize,
      devHours: input.devHours,
      skills: input.skills,
      budget: input.budget,
      constraints: input.constraints,
      goals: input.goals,
      problem: `Teams jump to a solution in ${domain} before they can state the user, constraint, and success test.`,
      targetUsers: "Student hackathon teams preparing a defensible problem statement.",
      existingApproaches: "Generic ideation canvases. This idea is a process tool, not a claim of originality.",
      evidenceNotes: research.detail,
      gaps: [],
      hypothesisGaps: ["Teams may skip evidence gathering because of time pressure — anecdotal, needs checking."],
      proposedInnovation: "A guided checklist that forces source, date, and confidence labels before locking a problem statement.",
      whyBetter: "It may produce more honest demos. It is not automatically more original.",
      architecture: "Form wizard + saved proposal JSON. No external research API required for MVP.",
      technologies: ["TypeScript", "local persistence"],
      mvpScope: "Wizard, three proposal cards, export markdown.",
      feasibility: `Fits a ${hours}-hour window if the UI stays simple.`,
      risks: ["Too meta for some tracks", "Judges want a domain demo, not a process demo"],
      evaluationMetrics: ["Every claim tagged hypothesis vs evidence", "Proposal export completeness"],
      demoStrategy: "Fill the wizard live using the actual hackathon prompt.",
      limitations: commonLimitations,
      scores: {
        impact: 3,
        noveltyPotential: 3,
        feasibility: 5,
        differentiation: 4,
        demonstrability: 4,
      },
      isPreliminary: true,
      researchAvailable: false,
    },
  ];

  return candidates.map((item, index) => ({
    ...item,
    id: `${id()}-${index}`,
    selected: false,
    createdAt: now,
    updatedAt: now,
  }));
}

export function validateHackathonInput(input: HackathonInput): string[] {
  const errors: string[] = [];
  if (!input || typeof input.domain !== "string" || !input.domain.trim()) errors.push("Domain is required");
  if (!input || typeof input.projectType !== "string" || !input.projectType) errors.push("Project type is required");
  if (!input || typeof input.teamSize !== "string" || !input.teamSize) errors.push("Team size is required");
  if (!input || typeof input.devHours !== "string" || !/^\d{1,4}$/.test(input.devHours) || Number(input.devHours) < 1) {
    errors.push("Estimated hours must be a positive number");
  }
  return errors;
}
