import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { AppState } from "@/types";
import { defaultState } from "./defaults";

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(STORE_DIR, "wayro-store.json");

const globalStore = globalThis as unknown as {
  wayroState?: AppState;
  wayroWriteQueue?: Promise<void>;
  wayroMutationQueue?: Promise<void>;
  wayroUserStates?: Map<string, AppState>;
  wayroUserMutationQueue?: Promise<void>;
};

function dataDirectory(): string {
  return process.env.WAYRO_DATA_DIR || STORE_DIR;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

async function readFromDisk(): Promise<AppState | null> {
  let raw: string;
  try {
    raw = await readFile(STORE_FILE, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw new Error(`Unable to read the local demo data store: ${error instanceof Error ? error.message : "unknown filesystem error"}`);
  }
  try {
    return JSON.parse(raw) as AppState;
  } catch (error) {
    throw new Error(`The local demo data store is not valid JSON: ${error instanceof Error ? error.message : "invalid file"}`);
  }
}

async function writeToDisk(state: AppState): Promise<void> {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(state, null, 2), "utf8");
}

export async function loadState(): Promise<AppState> {
  if (globalStore.wayroState) return clone(globalStore.wayroState);
  const disk = await readFromDisk();
  const state = disk ?? defaultState();
  if (!state.persistence) state.persistence = defaultState().persistence;
  globalStore.wayroState = state;
  return clone(state);
}

export async function saveState(next: AppState): Promise<AppState> {
  const snapshot = clone(next);
  const previous = globalStore.wayroWriteQueue ?? Promise.resolve();
  const write = previous.then(async () => {
    await writeToDisk(snapshot);
    globalStore.wayroState = snapshot;
  });
  globalStore.wayroWriteQueue = write;
  try {
    await write;
  } catch (error) {
    if (globalStore.wayroWriteQueue === write) globalStore.wayroWriteQueue = Promise.resolve();
    throw error;
  }
  return clone(snapshot);
}

export async function updateState(mutator: (current: AppState) => AppState): Promise<AppState> {
  const previous = globalStore.wayroMutationQueue ?? Promise.resolve();
  const operation = previous.then(async () => {
    const current = await loadState();
    return saveState(mutator(current));
  });
  globalStore.wayroMutationQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

function userStateFile(userId: string): string {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) throw new Error("Invalid student account identifier.");
  return path.join(dataDirectory(), "users", `${userId}.json`);
}

export async function loadStateForUser(userId: string): Promise<AppState> {
  const states = globalStore.wayroUserStates ??= new Map<string, AppState>();
  const cached = states.get(userId);
  if (cached) return clone(cached);

  let state: AppState;
  try {
    const raw = await readFile(userStateFile(userId), "utf8");
    try {
      state = JSON.parse(raw) as AppState;
    } catch (error) {
      throw new Error(`Student workspace data is not valid JSON: ${error instanceof Error ? error.message : "invalid file"}`);
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      state = defaultState();
    } else {
      throw new Error(`Unable to load student workspace data: ${error instanceof Error ? error.message : "unknown filesystem error"}`);
    }
  }
  if (!state.persistence) state.persistence = defaultState().persistence;
  states.set(userId, state);
  return clone(state);
}

export async function updateStateForUser(
  userId: string,
  mutator: (current: AppState) => AppState
): Promise<AppState> {
  const previous = globalStore.wayroUserMutationQueue ?? Promise.resolve();
  const operation = previous.then(async () => {
    const current = await loadStateForUser(userId);
    const snapshot = clone(mutator(current));
    const target = userStateFile(userId);
    const temporary = `${target}.${randomUUID()}.tmp`;
    await mkdir(path.dirname(target), { recursive: true });
    try {
      await writeFile(temporary, JSON.stringify(snapshot, null, 2), { encoding: "utf8", flag: "wx" });
      await rename(temporary, target);
    } catch (error) {
      throw new Error(`Unable to save student workspace data: ${error instanceof Error ? error.message : "unknown filesystem error"}`);
    }
    globalStore.wayroUserStates?.set(userId, snapshot);
    return clone(snapshot);
  });
  globalStore.wayroUserMutationQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export function resetStoreForTests(): void {
  globalStore.wayroState = defaultState();
  globalStore.wayroWriteQueue = Promise.resolve();
  globalStore.wayroMutationQueue = Promise.resolve();
  globalStore.wayroUserStates?.clear();
  globalStore.wayroUserMutationQueue = Promise.resolve();
}
