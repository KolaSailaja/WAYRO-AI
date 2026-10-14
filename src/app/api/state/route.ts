import { NextRequest, NextResponse } from "next/server";
import { getPublicState, updateStateForUser, pushActivity } from "@/lib/store";
import { parseProfile, profileSchema } from "@/lib/profile/schema";
import { getOpportunityById } from "@/lib/catalog/opportunities";
import { readJsonRequest } from "@/lib/server/read-json";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import type { AppState, ApplicationRecord, LearningTask, ReadinessTask } from "@/types";
import { z } from "zod";

class InvalidStateChange extends Error {}

export async function GET(request: NextRequest) {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Sign in to access workspace state." }, { status: 401 });
  }

  try {
    const data = await getPublicState(userId);
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to load the local demo data. Check that `.data` is readable." },
      { status: 500 }
    );
  }
}

const patchSchema = z.object({
  profile: profileSchema.omit({ id: true, updatedAt: true }).partial().optional(),
  toggleSave: z.string().min(1).max(120).optional(),
  application: z
    .object({
      opportunityId: z.string().min(1).max(120),
      status: z.enum([
        "interested",
        "preparing",
        "applied",
        "shortlisted",
        "selected",
        "rejected",
        "withdrawn",
      ]),
      notes: z.string().max(2000).optional(),
    })
    .optional(),
  learningTask: z
    .object({
      id: z.string().max(160).optional(),
      resourceId: z.string().max(120).optional(),
      skill: z.string().min(1).max(120),
      title: z.string().min(1).max(200),
      status: z.enum(["not_started", "in_progress", "completed"]),
      relatedOpportunityId: z.string().max(120).optional(),
    })
    .optional(),
  readinessTasks: z
    .array(
      z.object({
        id: z.string().max(200),
        opportunityId: z.string().max(120),
        label: z.string().max(200),
        detail: z.string().max(1000),
        skill: z.string().max(120).optional(),
        resourceId: z.string().max(120).optional(),
        completed: z.boolean(),
      })
    )
    .max(300)
    .optional(),
  toggleReadinessTask: z.string().max(200).optional(),
  settings: z
    .object({
      deadlineReminders: z.boolean(),
      matchAlerts: z.boolean(),
      reducedMotion: z.boolean(),
      largeText: z.boolean(),
      inAppRemindersEnabled: z.boolean(),
    })
    .optional(),
  selectProposal: z.string().max(200).optional(),
  updateProposal: z
    .object({
      id: z.string().max(200),
      patch: z
        .object({
          title: z.string().trim().min(1).max(160).optional(),
          problem: z.string().trim().min(1).max(2000).optional(),
          proposedInnovation: z.string().trim().min(1).max(2000).optional(),
        })
        .strict()
        .refine((value) => Object.keys(value).length > 0, "Provide at least one proposal field to update."),
    })
    .optional(),
});

export async function PATCH(request: NextRequest) {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Sign in to change workspace state." }, { status: 401 });
  }

  const result = await readJsonRequest(request, 256 * 1024);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  const parsed = patchSchema.safeParse(result.value);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 }
    );
  }

  const body = parsed.data;
  if (Object.keys(body).length === 0) {
    return NextResponse.json({ ok: false, error: "Provide at least one supported state change." }, { status: 400 });
  }
  const opportunityId = body.toggleSave ?? body.application?.opportunityId;
  if (opportunityId && !getOpportunityById(opportunityId)) {
    return NextResponse.json({ ok: false, error: "Opportunity does not exist in the current catalogue." }, { status: 404 });
  }

  try {
    const data = await updateStateForUser(userId, (current) => {
      let next: AppState = { ...current };

      if (body.profile) {
        const result = parseProfile({
          ...current.profile,
          ...body.profile,
          id: current.profile.id,
          updatedAt: new Date().toISOString(),
        });
        if (!result.success) {
          throw new InvalidStateChange(result.error);
        }
        next = pushActivity(
          { ...next, profile: result.data },
          { type: "profile", title: "Updated profile", href: "/profile" }
        );
      }

      if (body.toggleSave) {
        const exists = next.savedIds.includes(body.toggleSave);
        next = pushActivity(
          {
            ...next,
            savedIds: exists
              ? next.savedIds.filter((id) => id !== body.toggleSave)
              : [...next.savedIds, body.toggleSave],
          },
          {
            type: "save",
            title: exists ? "Removed a saved opportunity" : "Saved an opportunity",
            href: `/opportunities/${body.toggleSave}`,
          }
        );
      }

      if (body.application) {
        const existing = next.applications.find((a) => a.opportunityId === body.application!.opportunityId);
        const record: ApplicationRecord = {
          id: existing?.id ?? `app-${body.application.opportunityId}`,
          opportunityId: body.application.opportunityId,
          status: body.application.status,
          notes: body.application.notes ?? existing?.notes ?? "",
          updatedAt: new Date().toISOString(),
        };
        next = pushActivity(
          {
            ...next,
            applications: [
              record,
              ...next.applications.filter((a) => a.opportunityId !== record.opportunityId),
            ],
          },
          {
            type: "application",
            title: `Application status → ${record.status}`,
            href: `/opportunities/${record.opportunityId}`,
          }
        );
      }

      if (body.learningTask) {
        const id = body.learningTask.id ?? `learn-${body.learningTask.resourceId ?? body.learningTask.skill}`;
        const task: LearningTask = {
          id,
          resourceId: body.learningTask.resourceId,
          skill: body.learningTask.skill,
          title: body.learningTask.title,
          status: body.learningTask.status,
          relatedOpportunityId: body.learningTask.relatedOpportunityId,
          updatedAt: new Date().toISOString(),
        };
        next = pushActivity(
          {
            ...next,
            learningTasks: [task, ...next.learningTasks.filter((t) => t.id !== id)],
          },
          {
            type: "learning",
            title: `${task.status === "completed" ? "Completed" : "Updated"}: ${task.title}`,
            href: "/learn",
          }
        );
      }

      if (body.readinessTasks) {
        const incoming: ReadinessTask[] = body.readinessTasks;
        const others = next.readinessTasks.filter(
          (t) => !incoming.some((i) => i.opportunityId === t.opportunityId)
        );
        next = { ...next, readinessTasks: [...incoming, ...others] };
      }

      if (body.toggleReadinessTask) {
        if (!next.readinessTasks.some((task) => task.id === body.toggleReadinessTask)) {
          throw new InvalidStateChange("Readiness task does not exist.");
        }
        next = {
          ...next,
          readinessTasks: next.readinessTasks.map((t) =>
            t.id === body.toggleReadinessTask ? { ...t, completed: !t.completed } : t
          ),
        };
      }

      if (body.settings) {
        next = pushActivity(
          { ...next, settings: body.settings },
          { type: "settings", title: "Updated preferences", href: "/settings" }
        );
      }

      if (body.selectProposal) {
        if (!next.proposals.some((proposal) => proposal.id === body.selectProposal)) {
          throw new InvalidStateChange("Proposal does not exist.");
        }
        next = {
          ...next,
          proposals: next.proposals.map((p) => ({
            ...p,
            selected: p.id === body.selectProposal,
            updatedAt: new Date().toISOString(),
          })),
        };
        next = pushActivity(next, {
          type: "hackathon",
          title: "Selected a proposal",
          href: "/hackathon-lab",
        });
      }

      if (body.updateProposal) {
        if (!next.proposals.some((proposal) => proposal.id === body.updateProposal!.id)) {
          throw new InvalidStateChange("Proposal does not exist.");
        }
        next = {
          ...next,
          proposals: next.proposals.map((p) =>
            p.id === body.updateProposal!.id
              ? { ...p, ...body.updateProposal!.patch, id: p.id, updatedAt: new Date().toISOString() }
              : p
          ),
        };
      }

      return next;
    });

    return NextResponse.json({ ok: true, data: { ...data, persistence: (await getPublicState(userId)).persistence } });
  } catch (error) {
    if (error instanceof InvalidStateChange) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { ok: false, error: "Unable to save local demo data. Check that `.data` is writable and retry." },
      { status: 500 }
    );
  }
}
