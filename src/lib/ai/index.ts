/**
 * src/lib/ai/index.ts
 *
 * AI service factory.
 *
 * Reads AI_PROVIDER from the environment and returns the appropriate
 * concrete implementation. Product code should import getAIService()
 * rather than instantiating a provider directly.
 *
 * Usage:
 *   import { getAIService } from "@/lib/ai";
 *   const ai = getAIService();
 *   const result = await ai.complete({ messages: [...] });
 */

import type { AIService } from "./types";
import { MockAIProvider } from "./mock-provider";

let _instance: AIService | null = null;

export function getAIService(): AIService {
  if (_instance) return _instance;

  const provider = process.env.AI_PROVIDER ?? "mock";

  if (provider !== "mock") {
    throw new Error(
      `AI_PROVIDER "${provider}" is not implemented. Set AI_PROVIDER=mock for the deterministic local demo.`
    );
  }

  _instance = new MockAIProvider();
  return _instance;
}

export type { AIService, AICompletionRequest, AICompletionResponse } from "./types";
