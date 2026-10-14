/**
 * src/lib/ai/mock-provider.ts
 *
 * Mock AI provider for development and testing.
 *
 * Returns deterministic, clearly-labelled placeholder responses so that
 * the rest of the application can be developed and tested without a
 * live AI API key.
 *
 * IMPORTANT: These are synthetic responses. They are NOT real AI output
 * and must never be presented to students as genuine research results.
 */

import type {
  AICompletionRequest,
  AICompletionResponse,
  AIService,
} from "./types";

export class MockAIProvider implements AIService {
  providerName(): string {
    return "mock";
  }

  async complete(
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    const lastUserMessage =
      [...request.messages].reverse().find((m) => m.role === "user")
        ?.content ?? "(no user message)";

    // Simulate a short network delay for realistic integration testing
    await new Promise((resolve) => setTimeout(resolve, 150));

    return {
      content:
        `[MOCK RESPONSE – not real AI output]\n\n` +
        `You asked: "${lastUserMessage.slice(0, 120)}…"\n\n` +
        `This is a placeholder from the mock AI provider. ` +
        `Set AI_PROVIDER=openai (or another provider) in .env.local ` +
        `and supply an API key to enable real AI responses.`,
      model: "mock-v1",
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }
}
