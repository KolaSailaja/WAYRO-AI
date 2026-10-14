import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  value === "" || value === undefined ? undefined : value;

export const skillSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(60),
  category: z.string().default("general"),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
});

export const projectSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  url: z.preprocess(emptyToUndefined, z.string().url().optional()),
  skills: z.array(z.string()).default([]),
});

export const profileSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").max(80),
  email: z.preprocess(emptyToUndefined, z.string().email().optional()).transform((v) => v ?? ""),
  bio: z.string().max(400).default(""),
  institution: z.string().max(120).default(""),
  graduationYear: z.number().int().min(2020).max(2038).optional(),
  fieldOfStudy: z.string().max(80).default(""),
  location: z.string().max(80).default(""),
  remotePreference: z.enum(["", "remote", "hybrid", "in-person"]).default(""),
  weeklyHours: z.number().int().min(1).max(80).optional(),
  skills: z.array(skillSchema).max(100).default([]),
  goals: z.string().max(500).default(""),
  targetRoles: z.string().max(200).default(""),
  interests: z.array(z.string().trim().min(1).max(100)).max(100).default([]),
  preferredTypes: z.array(z.enum([
    "internship",
    "job",
    "hackathon",
    "scholarship",
    "fellowship",
    "research",
    "competition",
    "course",
  ])).max(8).default([]),
  projects: z.array(projectSchema).max(100).default([]),
  portfolioUrl: z.preprocess(emptyToUndefined, z.string().url().optional()).transform((v) => v ?? ""),
  githubUrl: z.preprocess(emptyToUndefined, z.string().url().optional()).transform((v) => v ?? ""),
  linkedinUrl: z.preprocess(emptyToUndefined, z.string().url().optional()).transform((v) => v ?? ""),
  updatedAt: z.string(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export function parseProfile(input: unknown): { success: true; data: ProfileInput } | { success: false; error: string } {
  const result = profileSchema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return { success: false, error: message };
  }
  return { success: true, data: result.data };
}
