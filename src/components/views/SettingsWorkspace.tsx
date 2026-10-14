"use client";

import { useAppState } from "@/components/app/AppStateProvider";
import { PageHeading, SectionCard } from "@/components/ui";
import type { UserSettings } from "@/types";

const OPTIONS: Array<{ key: keyof UserSettings; label: string; description: string }> = [
  { key: "deadlineReminders", label: "Deadline reminders", description: "Show in-app reminders for tracked listings with deadlines within 14 days." },
  { key: "matchAlerts", label: "Match alerts preference", description: "Store your preference for future match notifications. No email or push delivery is configured." },
  { key: "inAppRemindersEnabled", label: "In-app reminders", description: "Enable reminders in the dashboard." },
  { key: "reducedMotion", label: "Reduced motion", description: "Reduce interface animation and movement." },
  { key: "largeText", label: "Larger text", description: "Increase text size across the app." },
];

export function SettingsWorkspace() {
  const { state, patch, error } = useAppState();

  function update(key: keyof UserSettings, value: boolean) {
    void patch({ settings: { ...state.settings, [key]: value } });
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "wayro-data-export.json";
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="animate-fadein max-w-3xl mx-auto">
      <PageHeading title="Settings" subtitle="Manage local preferences and your demonstration data." />
      {error && <p role="alert" className="text-sm text-red-700 mb-4">{error}</p>}
      <SectionCard className="mb-5">
        <h2 className="font-semibold mb-2">Notifications & accessibility</h2>
        {OPTIONS.map((option) => (
          <label key={option.key} className="flex items-center justify-between gap-4 py-3 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
            <span><span className="block text-sm font-medium">{option.label}</span><span className="block text-xs text-slate-500 mt-1">{option.description}</span></span>
            <input type="checkbox" checked={state.settings[option.key]} onChange={(event) => update(option.key, event.target.checked)} aria-label={option.label} />
          </label>
        ))}
      </SectionCard>
      <SectionCard className="mb-5">
        <h2 className="font-semibold mb-2">Storage and account</h2>
        <p className="text-sm text-slate-600">No sign-in is configured. This local demo has no account-level isolation. {state.persistence.label}</p>
      </SectionCard>
      <SectionCard>
        <h2 className="font-semibold mb-2">Your data</h2>
        <p className="text-sm text-slate-600 mb-3">Download the current profile, preferences, and tracked activity as JSON.</p>
        <button type="button" onClick={exportData} className="btn btn-secondary">Export my data</button>
      </SectionCard>
    </div>
  );
}
