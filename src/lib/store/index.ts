import { parseEnv } from "@/lib/env";
import type { AppState } from "@/types";
import { loadState, loadStateForUser } from "./demo-store";

export { loadState, loadStateForUser, saveState, updateState, updateStateForUser } from "./demo-store";
export { defaultState, emptyProfile, pushActivity } from "./defaults";

export function persistenceMode(): AppState["persistence"] {
  const env = parseEnv(process.env);
  return {
    mode: "demo-local",
    label: env.DATABASE_URL
      ? "Per-student local JSON files (`.data/users/`). DATABASE_URL is configured, but PostgreSQL persistence is not connected to application routes."
      : "Per-student local JSON files (`.data/users/`). No PostgreSQL connection is configured.",
  };
}

export async function getPublicState(userId?: string): Promise<AppState> {
  const state = userId ? await loadStateForUser(userId) : await loadState();
  return { ...state, persistence: persistenceMode() };
}
