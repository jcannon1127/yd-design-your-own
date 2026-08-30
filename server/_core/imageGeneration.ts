/**
 * AI image generation — provider plug point.
 *
 * Behavior:
 *   - If OPENAI_API_KEY is set, calls OpenAI's gpt-image-1 model.
 *   - If the key is unset or the provider fails, returns `{ url: null }`.
 *     Never echo the input print swatch — the UI shows an honest non-AI
 *     fallback without an "AI Preview" badge.
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

  // No provider configured — do not pretend the print crop is a mockup.
  if (!apiKey) {
    return { url: null };
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
      return { url: null };
    }

    const data = (await response.json()) as { data?: Array<{ url?: string; b64_json?: string }> };
    const first = data.data?.[0];
    if (first?.url) return { url: first.url };
    if (first?.b64_json) return { url: `data:image/png;base64,${first.b64_json}` };
    return { url: null };
  } catch (err) {
    console.warn("[imageGeneration] Provider error:", err);
    return { url: null };
  }
}
