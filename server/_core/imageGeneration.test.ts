import { afterEach, describe, expect, it, vi } from "vitest";
import { generateImage } from "./imageGeneration";

const SWATCH = "https://cdn.example/print-coral-reef.jpg";

describe("generateImage", () => {
  const originalKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalKey;
    }
    vi.restoreAllMocks();
  });

  it("returns null when OPENAI_API_KEY is unset — never the input swatch", async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await generateImage({
      prompt: "Original Bell in Coral Reef",
      originalImages: [{ url: SWATCH, mimeType: "image/jpeg" }],
    });
    expect(result.url).toBeNull();
  });

  it("returns null when the provider fails — never the input swatch", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 401 }));
    const result = await generateImage({
      prompt: "Original Bell in Coral Reef",
      originalImages: [{ url: SWATCH, mimeType: "image/jpeg" }],
    });
    expect(result.url).toBeNull();
  });

  it("returns null when the provider throws — never the input swatch", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));
    const result = await generateImage({
      prompt: "Original Bell in Coral Reef",
      originalImages: [{ url: SWATCH, mimeType: "image/jpeg" }],
    });
    expect(result.url).toBeNull();
  });
});
