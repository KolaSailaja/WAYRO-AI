/**
 * src/lib/ai/mock-provider.test.ts
 *
 * Unit tests for the mock AI provider.
 */
import { describe, it, expect } from "vitest";
import { MockAIProvider } from "./mock-provider";

describe("MockAIProvider", () => {
  const provider = new MockAIProvider();

  it("returns 'mock' as the provider name", () => {
    expect(provider.providerName()).toBe("mock");
  });

  it("resolves with a content string", async () => {
    const result = await provider.complete({
      messages: [{ role: "user", content: "Hello" }],
    });
    expect(typeof result.content).toBe("string");
    expect(result.content.length).toBeGreaterThan(0);
  });

  it("includes [MOCK RESPONSE] label in output", async () => {
    const result = await provider.complete({
      messages: [{ role: "user", content: "Test" }],
    });
    expect(result.content).toContain("[MOCK RESPONSE");
  });

  it("returns 'mock-v1' as the model", async () => {
    const result = await provider.complete({
      messages: [{ role: "user", content: "Test" }],
    });
    expect(result.model).toBe("mock-v1");
  });

  it("includes usage data", async () => {
    const result = await provider.complete({
      messages: [{ role: "user", content: "Test" }],
    });
    expect(result.usage).toBeDefined();
    expect(result.usage?.totalTokens).toBe(0);
  });
});
