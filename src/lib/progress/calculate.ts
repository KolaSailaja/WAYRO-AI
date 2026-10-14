import type { AppState, ApplicationStatus } from "@/types";

const TERMINAL: ApplicationStatus[] = ["applied", "shortlisted", "selected", "rejected", "withdrawn"];

export interface ProgressSummary {
  skillsTracked: number;
  learningCompleted: number;
  learningTotal: number;
  applicationsSent: number;
  savedCount: number;
  proposals: number;
  selectedProposal: boolean;
  profileCompletion: number;
  profileItems: Array<{ label: string; completed: boolean }>;
}

export function calculateProgress(state: AppState): ProgressSummary {
  const p = state.profile;
  const profileItems = [
    { label: "Name", completed: Boolean(p.name.trim()) },
    { label: "Education & graduation year", completed: Boolean(p.institution && p.graduationYear) },
    { label: "Technical skills", completed: p.skills.length > 0 },
    { label: "Career goals", completed: Boolean(p.goals.trim()) },
    { label: "Interests", completed: p.interests.length > 0 },
    { label: "Portfolio or project links", completed: Boolean(p.portfolioUrl || p.githubUrl || p.projects.length) },
  ];
  const done = profileItems.filter((i) => i.completed).length;

  return {
    skillsTracked: p.skills.length,
    learningCompleted: state.learningTasks.filter((t) => t.status === "completed").length,
    learningTotal: state.learningTasks.length,
    applicationsSent: state.applications.filter((a) => TERMINAL.includes(a.status)).length,
    savedCount: state.savedIds.length,
    proposals: state.proposals.length,
    selectedProposal: state.proposals.some((item) => item.selected),
    profileCompletion: Math.round((done / profileItems.length) * 100),
    profileItems,
  };
}

export function daysUntil(iso?: string, now = Date.now()): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - now) / 86400000);
}
