"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchState, patchState } from "@/lib/client/api";
import { defaultState } from "@/lib/store/defaults";
import { refreshCatalogStatuses } from "@/lib/catalog/opportunities";
import { inAppReminders } from "@/lib/reminders";
import type { AppState, DeadlineReminder, Opportunity } from "@/types";

interface AppContextValue {
  state: AppState;
  catalog: Opportunity[];
  reminders: DeadlineReminder[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  patch: (payload: Record<string, unknown>) => Promise<string | null>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const catalog = useMemo(() => refreshCatalogStatuses(), []);

  const refresh = useCallback(async () => {
    const result = await fetchState();
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setState(result.data);
    setError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchState();
      if (cancelled) return;
      if (!result.ok) setError(result.error);
      else setState(result.data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = useCallback(async (payload: Record<string, unknown>) => {
    const result = await patchState(payload);
    if (!result.ok) {
      setError(result.error);
      return result.error;
    }
    setState(result.data);
    setError(null);
    return null;
  }, []);

  const reminders = useMemo(() => inAppReminders(state, catalog), [state, catalog]);

  useEffect(() => {
    document.documentElement.dataset.largeText = state.settings.largeText ? "true" : "false";
    document.documentElement.dataset.reducedMotion = state.settings.reducedMotion ? "true" : "false";
  }, [state.settings.largeText, state.settings.reducedMotion]);

  const value = useMemo(
    () => ({ state, catalog, reminders, loading, error, refresh, patch }),
    [state, catalog, reminders, loading, error, refresh, patch]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
