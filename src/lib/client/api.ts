import type { AppState, ApiResponse } from "@/types";

async function parse<T>(res: Response): Promise<ApiResponse<T>> {
  let body: ApiResponse<T>;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    return { ok: false, error: `The server returned an invalid response (${res.status}).` };
  }
  if (!body || typeof body !== "object" || typeof body.ok !== "boolean") {
    return { ok: false, error: `The server returned an invalid response (${res.status}).` };
  }
  return body;
}

export async function fetchState(): Promise<ApiResponse<AppState>> {
  try {
    const res = await fetch("/api/state", { cache: "no-store" });
    return await parse<AppState>(res);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? `Unable to reach the state service: ${error.message}` : "Unable to reach the state service.",
    };
  }
}

export async function patchState(payload: Record<string, unknown>): Promise<ApiResponse<AppState>> {
  try {
    const res = await fetch("/api/state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await parse<AppState>(res);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? `Unable to save state: ${error.message}` : "Unable to save state.",
    };
  }
}
