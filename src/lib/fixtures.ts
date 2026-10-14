/**
 * Compatibility re-exports for demonstration catalogues.
 * Prefer importing from `@/lib/catalog/*` in new code.
 */

import { OPPORTUNITY_CATALOG } from "@/lib/catalog/opportunities";
import { LEARNING_CATALOG } from "@/lib/catalog/learning";
import type { Opportunity } from "@/types";

export const DEMO_OPPORTUNITIES: Opportunity[] = OPPORTUNITY_CATALOG;

export const DEMO_LEARNING_STEPS = LEARNING_CATALOG.slice(0, 4).map((resource, index) => ({
  step: index + 1,
  skill: resource.skills[0] ?? "General",
  resource: resource.title,
  provider: resource.provider,
  status: (index === 0 ? "completed" : index === 1 ? "in_progress" : "upcoming") as
    | "completed"
    | "in_progress"
    | "upcoming",
}));

export const DEMO_PROFILE_COMPLETION = [
  { label: "Education & graduation year", completed: false },
  { label: "Technical skills", completed: false },
  { label: "Career goals", completed: false },
  { label: "Interests", completed: false },
  { label: "Portfolio or project links", completed: false },
];
