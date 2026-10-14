import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { getAIService } from "@/lib/ai";
import { buildOpportunityCoachPlan } from "@/lib/ai/coaching";
import { OPPORTUNITY_CATALOG, getOpportunityById } from "@/lib/catalog/opportunities";
import { rankOpportunities } from "@/lib/matching/score";
import { getPublicState } from "@/lib/store";

const coachSchema = z.object({
  opportunityId: z.string().trim().min(1).max(120).optional(),
  goal: z.string().trim().min(1).max(500).optional(),
});

export async function POST(request: NextRequest) {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Sign in to use the WAYRO AI coach." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "A valid JSON request body is required." }, { status: 400 });
  }

  const parsed = coachSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues.map((issue) => issue.message).join("; ") },
      { status: 400 }
    );
  }

  try {
    const state = await getPublicState(userId);
    const opportunity = parsed.data.opportunityId
      ? getOpportunityById(parsed.data.opportunityId)
      : rankOpportunities(state.profile, OPPORTUNITY_CATALOG)[0]?.opportunity ?? OPPORTUNITY_CATALOG[0];

    if (!opportunity) {
      return NextResponse.json({ ok: false, error: "No opportunity was available for a coach recommendation." }, { status: 404 });
    }

    const plan = buildOpportunityCoachPlan(state.profile, opportunity, parsed.data.goal);
    const ai = getAIService();
    const aiResponse = await ai.complete({
      messages: [
        {
          role: "system",
          content: "You are a helpful WAYRO AI student opportunity coach. Explain in plain language, never claim a guaranteed outcome, and keep the advice action-oriented.",
        },
        {
          role: "user",
          content: `Student profile: ${state.profile.name || "Unknown student"}, goals: ${state.profile.goals || "No goals recorded"}, skills: ${state.profile.skills.map((skill) => skill.name).join(", ") || "No listed skills"}. Opportunity: ${opportunity.title}. Needs: ${opportunity.skills.join(", ")}. Provide a brief 2–3 sentence actionable coach message with 3 next steps and a reminder that this is a demo recommendation only.`,
        },
      ],
      maxTokens: 220,
      temperature: 0.3,
    });

    return NextResponse.json({
      ok: true,
      data: {
        plan,
        provider: ai.providerName(),
        model: aiResponse.model,
        response: aiResponse.content,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to build a coach recommendation.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
