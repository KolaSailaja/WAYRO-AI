import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateProposals, validateHackathonInput, type HackathonInput } from "@/lib/hackathon/generate";
import { getResearchProvider } from "@/lib/research";
import { readJsonRequest } from "@/lib/server/read-json";
import { updateStateForUser, pushActivity } from "@/lib/store";
import { getAuthenticatedUserId } from "@/lib/auth/session";

const hackathonInputSchema = z.object({
  challengeName: z.string().max(160).default(""),
  domain: z.string().trim().min(1).max(120),
  projectType: z.enum(["software", "hardware", "hybrid", "data", "design"]),
  theme: z.string().max(2000).default(""),
  teamSize: z.enum(["solo", "2", "3", "4", "5+"]),
  devHours: z.string().regex(/^\d{1,4}$/),
  skills: z.string().max(1000).default(""),
  budget: z.string().max(200).default(""),
  constraints: z.string().max(2000).default(""),
  goals: z.string().max(1000).default(""),
});

export async function POST(request: NextRequest) {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Sign in to generate proposals." }, { status: 401 });
  }

  const result = await readJsonRequest(request, 16 * 1024);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  const parsed = hackathonInputSchema.safeParse(result.value);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") },
      { status: 400 }
    );
  }

  const body: HackathonInput = parsed.data;
  const errors = validateHackathonInput(body);
  if (errors.length) {
    return NextResponse.json({ ok: false, error: errors.join("; ") }, { status: 400 });
  }

  const research = await getResearchProvider().search(
    `${body.domain} ${body.theme} existing solutions limitations`
  );
  const proposals = generateProposals(body, research);
  const state = await updateStateForUser(userId, (current) =>
    pushActivity(
      { ...current, proposals: [...proposals, ...current.proposals] },
      { type: "hackathon", title: "Generated preliminary proposal drafts", href: "/hackathon-lab" }
    )
  );

  return NextResponse.json({
    ok: true,
    data: {
      proposals,
      research,
      persistence: state.persistence,
    },
  });
}
