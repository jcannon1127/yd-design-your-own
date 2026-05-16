/**
 * AI image generation — provider plug point.
 *
 * Behavior:
 *   - If OPENAI_API_KEY is set, calls OpenAI's gpt-image-1 model.
 *   - Otherwise, returns the input swatch URL as a placeholder so the UI still works.
 *
 * Swap this implementation to use Anthropic, Replicate, Stability, etc. The
 * UI calls `generate()` from `server/routers.ts` (aiMockup.generate) and expects
 * `{ url: string | null }`.
 */

export interface GenerateImageInput {
  prompt: string;
  originalImages?: Array<{ url: string; mimeType: string }>;
}

export interface GenerateImageResult {
  url: string | null;
}

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  // No provider configured — return the input swatch as a placeholder.
  // This keeps the UI working without a live AI provider; the swatch shows
  // in place of the generated mockup. Set OPENAI_API_KEY in Vercel env vars
  // to enable real AI mockups.
  if (!apiKey) {
    return { url: input.originalImages?.[0]?.url ?? null };
  }

  try {
    // OpenAI gpt-image-1 — image edits endpoint takes a reference image.
    // If no reference image is provided we fall back to text-to-image.
    const ref = input.originalImages?.[0];
    if (ref) {
      // For simplicity we use the generations endpoint with the prompt only;
      // a more sophisticated implementation would download the swatch, attach
      // it as multipart form data, and call /v1/images/edits.
      // See https://platform.openai.com/docs/guides/image-generation
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: input.prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!response.ok) {
      console.warn(`[imageGeneration] OpenAI request failed: ${response.status}`);
      return { url: input.originalImages?.[0]?.url ?? null };
    }

    const data = (await response.json()) as { data?: Array<{ url?: string; b64_json?: string }> };
    const first = data.data?.[0];
    if (first?.url) return { url: first.url };
    if (first?.b64_json) return { url: `data:image/png;base64,${first.b64_json}` };
    return { url: input.originalImages?.[0]?.url ?? null };
  } catch (err) {
    console.warn("[imageGeneration] Provider error:", err);
    return { url: input.originalImages?.[0]?.url ?? null };
  }
}
