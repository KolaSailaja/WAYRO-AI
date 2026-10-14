/**
 * src/lib/ai/types.ts
 *
 * Provider-agnostic AI service interface.
 *
 * All AI interactions go through this interface. Concrete provider
 * implementations (OpenAI, Anthropic, Google, mock) live in separate
 * files and are selected at runtime via the AI_PROVIDER env variable.
 *
 * This keeps product code decoupled from any specific AI vendor.
 */

// ── Core message types ─────────────────────────────────────────────────────

export type MessageRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

// ── Request / response ────────────────────────────────────────────────────

export interface AICompletionRequest {
  messages: ChatMessage[];
  /** Approximate upper bound on output tokens. */
  maxTokens?: number;
  /** 0 = deterministic, 1 = creative. Defaults to 0.7. */
  temperature?: number;
}

export interface AICompletionResponse {
  content: string;
  /** Provider-specific model identifier used for the response. */
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// ── Service interface ────────────────────────────────────────────────────

/**
 * AIService is the single contract that all provider implementations satisfy.
 * Add new methods here (e.g., embed, streamCompletion) as needed.
 */
export interface AIService {
  /**
   * Send a chat completion request and return the full response.
   */
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;

  /**
   * Return the name of the underlying provider (for logging / debugging).
   */
  providerName(): string;
}
