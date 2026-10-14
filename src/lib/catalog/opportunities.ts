/**
 * Demonstration opportunity catalogue.
 * All records are synthetic Example-* listings, not verified live openings.
 */

import type { Opportunity, OpportunityStatus } from "@/types";

function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function statusForDeadline(days: number): OpportunityStatus {
  if (days < 0) return "closed";
  if (days <= 7) return "closing_soon";
  return "open";
}

function demo(
  partial: Omit<Opportunity, "isDemo" | "status" | "deadline" | "createdAt"> & {
    daysUntilDeadline?: number;
  }
): Opportunity {
  const days = partial.daysUntilDeadline;
  const deadline = days === undefined ? undefined : isoDaysFromNow(days);
  return {
    ...partial,
    deadline,
    status: days === undefined ? "open" : statusForDeadline(days),
    isDemo: true,
    createdAt: new Date().toISOString(),
  };
}

export const OPPORTUNITY_CATALOG: Opportunity[] = [
  demo({
    id: "demo-1",
    title: "Software Engineering Intern — AI Products",
    type: "internship",
    organization: "Example Tech Co.",
    description:
      "Join an AI products team for a 12-week internship. Contribute to features, learn from engineers, and work across the stack. This is a demonstration listing.",
    requirements: [
      "Currently enrolled in a CS or related degree",
      "Familiarity with at least one programming language",
      "Strong problem-solving skills",
    ],
    skills: ["Python", "React", "APIs", "Git"],
    eligibility: ["Enrolled student", "Able to intern for 12 weeks"],
    experience: "beginner",
    location: "Bengaluru, India",
    remote: true,
    applicationUrl: "https://example.com/careers",
    sourceUrl: "https://example.com/careers",
    daysUntilDeadline: 14,
  }),
  demo({
    id: "demo-2",
    title: "Smart Cities Student Hackathon",
    type: "hackathon",
    organization: "Example Innovation Foundation",
    description:
      "48-hour student hackathon on urban mobility, sustainability, and civic technology. Demonstration fixture only.",
    requirements: ["Student enrollment verification", "Team of 2–5 members"],
    skills: ["IoT", "Data Analysis", "Web Dev", "System Design"],
    eligibility: ["Student team"],
    experience: "any",
    location: "Hyderabad, India",
    remote: false,
    applicationUrl: "https://example.org/hackathon",
    sourceUrl: "https://example.org/hackathon",
    daysUntilDeadline: 5,
  }),
  demo({
    id: "demo-3",
    title: "STEM Excellence Scholarship",
    type: "scholarship",
    organization: "Example Education Trust",
    description:
      "Merit-based demonstration scholarship for undergraduate STEM students. Not a real award listing.",
    requirements: [
      "Undergraduate student in STEM",
      "GPA 3.5 or above (or equivalent)",
      "Financial need statement",
      "Two letters of recommendation",
    ],
    skills: ["Academic Excellence", "Leadership", "Community Service"],
    eligibility: ["Undergraduate", "STEM field"],
    location: "India",
    remote: true,
    applicationUrl: "https://example-trust.org/scholarship",
    sourceUrl: "https://example-trust.org/scholarship",
    daysUntilDeadline: 30,
  }),
  demo({
    id: "demo-4",
    title: "Junior Frontend Engineer",
    type: "job",
    organization: "Example Product Studio",
    description:
      "Demonstration full-time role for early-career frontend engineers. Not a live vacancy.",
    requirements: ["Portfolio of web projects", "Comfortable with Git and code review"],
    skills: ["React", "TypeScript", "CSS", "Git"],
    eligibility: ["Authorized to work in listed location or remote"],
    experience: "intermediate",
    location: "Remote",
    remote: true,
    applicationUrl: "https://example-studio.dev/jobs",
    sourceUrl: "https://example-studio.dev/jobs",
    daysUntilDeadline: 21,
  }),
  demo({
    id: "demo-5",
    title: "Climate Data Research Internship",
    type: "research",
    organization: "Example Climate Lab",
    description:
      "Demonstration research internship analysing open climate datasets. Not an official lab posting.",
    requirements: ["Coursework in statistics or data science", "Interest in climate or public data"],
    skills: ["Python", "Data Analysis", "Statistics"],
    eligibility: ["Undergraduate or masters student"],
    experience: "beginner",
    location: "Pune, India",
    remote: true,
    applicationUrl: "https://example-climate-lab.org/internships",
    sourceUrl: "https://example-climate-lab.org/internships",
    daysUntilDeadline: 18,
  }),
  demo({
    id: "demo-6",
    title: "Open Source Fellowship (Student Track)",
    type: "fellowship",
    organization: "Example Open Source Alliance",
    description:
      "Demonstration fellowship for contributing to public-interest open source. Not a live programme.",
    requirements: ["Prior open-source or project contributions", "Able to commit ~10 hours/week"],
    skills: ["Git", "Open Source", "Technical Writing"],
    eligibility: ["Student", "Available 10 hours/week"],
    experience: "beginner",
    location: "Remote",
    remote: true,
    applicationUrl: "https://example-osa.org/fellowship",
    sourceUrl: "https://example-osa.org/fellowship",
    daysUntilDeadline: 40,
  }),
  demo({
    id: "demo-7",
    title: "Campus Product Design Challenge",
    type: "competition",
    organization: "Example Design Guild",
    description:
      "Demonstration campus competition for product and UX case studies. Not an official contest.",
    requirements: ["Individual or pair submission", "Case-study writeup"],
    skills: ["UI/UX", "Product Thinking", "Figma"],
    eligibility: ["Enrolled student"],
    location: "Mumbai, India",
    remote: true,
    applicationUrl: "https://example-design-guild.org/challenge",
    sourceUrl: "https://example-design-guild.org/challenge",
    daysUntilDeadline: 9,
  }),
  demo({
    id: "demo-8",
    title: "Public CS Foundations Course Path",
    type: "course",
    organization: "Example Learning Network",
    description:
      "Demonstration learning path pointing at publicly documented CS topics. WAYRO AI does not award this certificate.",
    requirements: ["Internet access", "Willingness to practise weekly"],
    skills: ["Python", "Algorithms", "Git"],
    eligibility: ["Self-paced, any student"],
    experience: "beginner",
    location: "Online",
    remote: true,
    applicationUrl: "https://www.freecodecamp.org/learn",
    sourceUrl: "https://www.freecodecamp.org/learn",
    daysUntilDeadline: 90,
  }),
];

export function getOpportunityById(id: string): Opportunity | undefined {
  return OPPORTUNITY_CATALOG.find((item) => item.id === id);
}

export function refreshCatalogStatuses(now = Date.now()): Opportunity[] {
  return OPPORTUNITY_CATALOG.map((item) => {
    if (!item.deadline) return item;
    const days = Math.ceil((new Date(item.deadline).getTime() - now) / (1000 * 60 * 60 * 24));
    return { ...item, status: statusForDeadline(days) };
  });
}
