import type { AppState, StudentProfile, UserSettings } from "@/types";

export const DEMO_USER_ID = "demo-student";

export function emptyProfile(): StudentProfile {
  return {
    id: DEMO_USER_ID,
    name: "",
    email: "",
    bio: "",
    institution: "",
    graduationYear: undefined,
    fieldOfStudy: "",
    location: "",
    remotePreference: "",
    weeklyHours: undefined,
    skills: [],
    goals: "",
    targetRoles: "",
    interests: [],
    preferredTypes: [],
    projects: [],
    portfolioUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    updatedAt: new Date().toISOString(),
  };
}

export function defaultSettings(): UserSettings {
  return {
    deadlineReminders: true,
    matchAlerts: false,
    reducedMotion: false,
    largeText: false,
    inAppRemindersEnabled: true,
  };
}

export function defaultState(): AppState {
  return {
    persistence: {
      mode: "demo-local",
      label:
        "Per-student local JSON files (`.data/users/`). This is not PostgreSQL persistence.",
    },
    profile: emptyProfile(),
    savedIds: [],
    applications: [],
    learningTasks: [],
    readinessTasks: [],
    proposals: [],
    settings: defaultSettings(),
    activity: [],
  };
}

export function pushActivity(
  state: AppState,
  item: { type: string; title: string; href?: string }
): AppState {
  const entry = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...item,
  };
  return {
    ...state,
    activity: [entry, ...state.activity].slice(0, 40),
  };
}
