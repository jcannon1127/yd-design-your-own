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

  it("returns the print swatch with fallback:true when OPENAI_API_KEY is unset", async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await generateImage({
      prompt: "Original Bell in Coral Reef",
      originalImages: [{ url: SWATCH, mimeType: "image/jpeg" }],
    });
    expect(result).toEqual({ url: SWATCH, fallback: true });
  });

  it("returns the print swatch with fallback:true when the provider fails", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 401 }));
    const result = await generateImage({
      prompt: "Original Bell in Coral Reef",
      originalImages: [{ url: SWATCH, mimeType: "image/jpeg" }],
    });
    expect(result).toEqual({ url: SWATCH, fallback: true });
  });
});
