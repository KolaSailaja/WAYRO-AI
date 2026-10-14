/**
 * Demo learning catalogue. Links are to well-known public resources
 * used as examples. WAYRO AI does not award these credentials.
 */

import type { LearningResource } from "@/types";

export const LEARNING_CATALOG: LearningResource[] = [
  {
    id: "learn-python",
    title: "Python for Everybody (public course listing)",
    type: "course",
    provider: "University of Michigan / Coursera (public page)",
    url: "https://www.coursera.org/specializations/python",
    durationHours: 40,
    isFree: false,
    skills: ["Python"],
    isDemo: true,
    notes: "Example resource pointer. Confirm current pricing and syllabus on the provider site.",
  },
  {
    id: "learn-dsa",
    title: "CS50x — Introduction to Computer Science",
    type: "course",
    provider: "Harvard / edX (public page)",
    url: "https://cs50.harvard.edu/x/",
    durationHours: 80,
    isFree: true,
    skills: ["Algorithms", "C", "Python", "SQL"],
    isDemo: true,
    notes: "Public course homepage. Completion certificates are issued by the provider, not WAYRO AI.",
  },
  {
    id: "learn-web",
    title: "MDN Learn Web Development",
    type: "docs",
    provider: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
    durationHours: 30,
    isFree: true,
    skills: ["HTML", "CSS", "JavaScript", "React"],
    isDemo: true,
    notes: "Public documentation. Free to study; not a WAYRO certification.",
  },
  {
    id: "learn-fcc",
    title: "freeCodeCamp Responsive Web Design",
    type: "course",
    provider: "freeCodeCamp",
    url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
    durationHours: 50,
    isFree: true,
    skills: ["HTML", "CSS", "Web Dev"],
    isDemo: true,
    notes: "Public curriculum. Certificates come from freeCodeCamp, not WAYRO AI.",
  },
  {
    id: "learn-git",
    title: "Git Handbook",
    type: "docs",
    provider: "GitHub Docs",
    url: "https://docs.github.com/en/get-started/using-git",
    durationHours: 6,
    isFree: true,
    skills: ["Git", "Open Source"],
    isDemo: true,
    notes: "Official GitHub documentation.",
  },
  {
    id: "learn-apis",
    title: "MDN HTTP and REST basics",
    type: "article",
    provider: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
    durationHours: 8,
    isFree: true,
    skills: ["APIs", "HTTP"],
    isDemo: true,
    notes: "Public HTTP documentation.",
  },
  {
    id: "learn-data",
    title: "Python Data Analysis practices (pandas docs)",
    type: "docs",
    provider: "pandas",
    url: "https://pandas.pydata.org/docs/getting_started/index.html",
    durationHours: 12,
    isFree: true,
    skills: ["Python", "Data Analysis"],
    isDemo: true,
    notes: "Official pandas getting-started docs.",
  },
  {
    id: "learn-system",
    title: "System Design Primer (open source)",
    type: "article",
    provider: "GitHub (donnemartin/system-design-primer)",
    url: "https://github.com/donnemartin/system-design-primer",
    durationHours: 20,
    isFree: true,
    skills: ["System Design"],
    isDemo: true,
    notes: "Community-maintained primer. Not an accredited course.",
  },
];

export function findResourcesForSkill(skill: string): LearningResource[] {
  const needle = skill.toLowerCase();
  return LEARNING_CATALOG.filter((resource) =>
    resource.skills.some((item) => item.toLowerCase().includes(needle) || needle.includes(item.toLowerCase()))
  );
}
