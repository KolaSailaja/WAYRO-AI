/**
 * Shared domain types for WAYRO AI.
 * Independent of Prisma models and HTTP envelopes.
 */

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
}

export interface ProjectRecord {
  id: string;
  title: string;
  description?: string;
  url?: string;
  skills: string[];
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  institution: string;
  graduationYear?: number;
  fieldOfStudy: string;
  location: string;
  remotePreference: "" | "remote" | "hybrid" | "in-person";
  weeklyHours?: number;
  skills: Skill[];
  goals: string;
  targetRoles: string;
  interests: string[];
  preferredTypes: OpportunityType[];
  projects: ProjectRecord[];
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  updatedAt: string;
}

export type OpportunityType =
  | "internship"
  | "job"
  | "hackathon"
  | "scholarship"
  | "fellowship"
  | "research"
  | "competition"
  | "course";

export type OpportunityStatus = "open" | "closing_soon" | "closed";

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  organization: string;
  description: string;
  requirements: string[];
  skills: string[];
  eligibility: string[];
  experience?: string;
  location?: string;
  remote: boolean;
  deadline?: string;
  applicationUrl: string;
  sourceUrl?: string;
  status: OpportunityStatus;
  isDemo: true;
  createdAt: string;
}

export type ApplicationStatus =
  | "interested"
  | "preparing"
  | "applied"
  | "shortlisted"
  | "selected"
  | "rejected"
  | "withdrawn";

export interface ApplicationRecord {
  id: string;
  opportunityId: string;
  status: ApplicationStatus;
  notes: string;
  updatedAt: string;
}

export type LearningTaskStatus = "not_started" | "in_progress" | "completed";

export type ResourceType =
  | "course"
  | "certification"
  | "article"
  | "project"
  | "video"
  | "docs";

export interface LearningResource {
  id: string;
  title: string;
  type: ResourceType;
  provider: string;
  url: string;
  durationHours?: number;
  isFree: boolean;
  skills: string[];
  isDemo: true;
  notes: string;
}

export interface LearningTask {
  id: string;
  resourceId?: string;
  skill: string;
  title: string;
  status: LearningTaskStatus;
  relatedOpportunityId?: string;
  updatedAt: string;
}

export interface ReadinessTask {
  id: string;
  opportunityId: string;
  label: string;
  detail: string;
  skill?: string;
  resourceId?: string;
  completed: boolean;
}

export interface HackathonProposal {
  id: string;
  title: string;
  domain: string;
  challengeName: string;
  projectType: string;
  theme: string;
  teamSize: string;
  devHours: string;
  skills: string;
  budget: string;
  constraints: string;
  goals: string;
  problem: string;
  targetUsers: string;
  existingApproaches: string;
  evidenceNotes: string;
  gaps: string[];
  hypothesisGaps: string[];
  proposedInnovation: string;
  whyBetter: string;
  architecture: string;
  technologies: string[];
  mvpScope: string;
  feasibility: string;
  risks: string[];
  evaluationMetrics: string[];
  demoStrategy: string;
  limitations: string;
  scores: {
    impact: number;
    noveltyPotential: number;
    feasibility: number;
    differentiation: number;
    demonstrability: number;
  };
  isPreliminary: true;
  researchAvailable: boolean;
  selected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  deadlineReminders: boolean;
  matchAlerts: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  inAppRemindersEnabled: boolean;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  href?: string;
  createdAt: string;
}

export interface DeadlineReminder {
  opportunityId: string;
  title: string;
  daysLeft: number;
  deadline: string;
}

export interface PersistenceInfo {
  mode: "demo-local";
  label: string;
}

export interface AppState {
  persistence: PersistenceInfo;
  profile: StudentProfile;
  savedIds: string[];
  applications: ApplicationRecord[];
  learningTasks: LearningTask[];
  readinessTasks: ReadinessTask[];
  proposals: HackathonProposal[];
  settings: UserSettings;
  activity: ActivityItem[];
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
