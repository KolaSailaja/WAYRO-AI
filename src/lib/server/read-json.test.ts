import { describe, expect, it } from "vitest";
import { readJsonRequest } from "./read-json";

describe("readJsonRequest", () => {
  it("parses valid JSON within the byte limit", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic: "learning" }),
    });

    await expect(readJsonRequest(request, 128)).resolves.toEqual({
      ok: true,
      value: { topic: "learning" },
    });
  });

  it("rejects oversized requests before reading the body", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      headers: { "content-length": "129" },
      body: "{}",
    });

    await expect(readJsonRequest(request, 128)).resolves.toMatchObject({
      ok: false,
      status: 413,
    });
  });

  it("rejects malformed JSON", async () => {
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: "{",
    });

    await expect(readJsonRequest(request, 128)).resolves.toMatchObject({
      ok: false,
      status: 400,
    });
  });
});
