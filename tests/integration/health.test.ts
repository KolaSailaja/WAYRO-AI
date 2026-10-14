/**
 * tests/integration/health.test.ts
 *
 * Integration test for GET /api/health.
 * Imports the route handler directly and verifies the response contract.
 */
import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns 200 with ok status", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it("returns expected JSON shape", async () => {
    const response = await GET();
    const body = await response.json();
    expect(body).toMatchObject({
      status: "ok",
      environment: expect.any(String),
      version: expect.any(String),
      timestamp: expect.any(String),
    });
  });

  it("timestamp is a valid ISO 8601 date", async () => {
    const response = await GET();
    const body = await response.json();
    expect(() => new Date(body.timestamp)).not.toThrow();
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });
});
