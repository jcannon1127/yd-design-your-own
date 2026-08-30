/**
 * AI image generation — provider plug point.
 *
 * Behavior:
 *   - If OPENAI_API_KEY is set, calls OpenAI's gpt-image-1 generations API.
 *   - If the key is unset or the provider fails, returns the input swatch URL
 *     with `fallback: true` so the UI can show it without an "AI Preview" badge.
 *
 * This is not a garment compositor. Do not attach keys or call image edits here.
 */

export interface GenerateImageInput {
  prompt: string;
  originalImages?: Array<{ url: string; mimeType: string }>;
}

export interface GenerateImageResult {
  url: string | null;
  fallback: boolean;
}

function swatchFallback(input: GenerateImageInput): GenerateImageResult {
  return { url: input.originalImages?.[0]?.url ?? null, fallback: true };
}

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return swatchFallback(input);
  }

  try {
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
      return swatchFallback(input);
    }

    const data = (await response.json()) as { data?: Array<{ url?: string; b64_json?: string }> };
    const first = data.data?.[0];
    if (first?.url) return { url: first.url, fallback: false };
    if (first?.b64_json) return { url: `data:image/png;base64,${first.b64_json}`, fallback: false };
    return swatchFallback(input);
  } catch (err) {
    console.warn("[imageGeneration] Provider error:", err);
    return swatchFallback(input);
  }
}
