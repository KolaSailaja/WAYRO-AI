import type { AppState, DeadlineReminder, Opportunity } from "@/types";
import { daysUntil } from "@/lib/progress/calculate";

export function inAppReminders(
  state: AppState,
  catalog: Opportunity[],
  now = Date.now()
): DeadlineReminder[] {
  if (!state.settings.inAppRemindersEnabled || !state.settings.deadlineReminders) {
    return [];
  }
  const tracked = new Set([
    ...state.savedIds,
    ...state.applications.map((a) => a.opportunityId),
  ]);
  const reminders: DeadlineReminder[] = [];
  for (const id of tracked) {
    const opp = catalog.find((item) => item.id === id);
    if (!opp?.deadline) continue;
    const days = daysUntil(opp.deadline, now);
    if (days === null || days < 0 || days > 14) continue;
    reminders.push({
      opportunityId: opp.id,
      title: opp.title,
      daysLeft: days,
      deadline: opp.deadline,
    });
  }
  return reminders.sort((a, b) => a.daysLeft - b.daysLeft);
}
