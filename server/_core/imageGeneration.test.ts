import { afterEach, describe, expect, it, vi } from "vitest";
import { generateImage } from "./imageGeneration";

const SWATCH = "https://cdn.example/print-coral-reef.jpg";
const MOCKUP = "https://cdn.example/generated-bell.png";

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

  it("returns fallback:true when OPENAI_API_KEY is unset — never the input swatch", async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await generateImage({
      prompt: "Original Bell in Coral Reef",
      originalImages: [{ url: SWATCH, mimeType: "image/jpeg" }],
    });
    expect(result).toEqual({ url: null, fallback: true });
  });

  it("returns fallback:true when the provider fails — never the input swatch", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 401 }));
    const result = await generateImage({
      prompt: "Original Bell in Coral Reef",
      originalImages: [{ url: SWATCH, mimeType: "image/jpeg" }],
    });
    expect(result).toEqual({ url: null, fallback: true });
  });

  it("returns fallback:true when the provider throws — never the input swatch", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));
    const result = await generateImage({
      prompt: "Original Bell in Coral Reef",
      originalImages: [{ url: SWATCH, mimeType: "image/jpeg" }],
    });
    expect(result).toEqual({ url: null, fallback: true });
  });

  it("returns fallback:true when the provider echoes the print crop URL", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("not-an-image", { status: 200, headers: { "content-type": "text/html" } }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ url: SWATCH }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );
    const result = await generateImage({
      prompt: "Original Bell in Coral Reef",
      originalImages: [{ url: SWATCH, mimeType: "image/jpeg" }],
    });
    expect(result).toEqual({ url: null, fallback: true });
  });

  it("returns fallback:false only for a distinct generated URL", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("not-an-image", { status: 200, headers: { "content-type": "text/html" } }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ url: MOCKUP }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );
    const result = await generateImage({
      prompt: "Original Bell in Coral Reef",
      originalImages: [{ url: SWATCH, mimeType: "image/jpeg" }],
    });
    expect(result).toEqual({ url: MOCKUP, fallback: false });
  });
});
