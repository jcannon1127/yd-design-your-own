/**
 * AI image generation — provider plug point.
 *
 * Behavior:
 *   - If OPENAI_API_KEY is set, prefers /v1/images/edits (swatch attached)
 *     and falls back to /v1/images/generations.
 *   - If the key is unset, the provider fails, or the provider echoes the
 *     input print URL, returns `{ url: null, fallback: true }`.
 *     Never echo the input print swatch — the UI must not show an
 *     "AI Preview" badge on a raw crop.
 *
 * Swap this implementation to use Anthropic, Replicate, Stability, etc. The
 * UI calls `generate()` from `server/routers.ts` (aiMockup.generate) and expects
 * `{ url: string | null, fallback: boolean }`.
 */

export interface GenerateImageInput {
  prompt: string;
  originalImages?: Array<{ url: string; mimeType: string }>;
}

export interface GenerateImageResult {
  url: string | null;
  fallback: boolean;
}

function placeholder(): GenerateImageResult {
  return { url: null, fallback: true };
}

function generated(url: string, sourceUrl?: string): GenerateImageResult {
  if (!url || (sourceUrl && url === sourceUrl)) return placeholder();
  return { url, fallback: false };
}

function readImageUrl(payload: { data?: Array<{ url?: string; b64_json?: string }> }): string | null {
  const first = payload.data?.[0];
  if (first?.url) return first.url;
  if (first?.b64_json) return `data:image/png;base64,${first.b64_json}`;
  return null;
}

async function tryImageEdits(
  apiKey: string,
  prompt: string,
  imageUrl: string
): Promise<string | null> {
  try {
    const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) });
    if (!imgRes.ok) return null;
    const mime = imgRes.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
    if (!mime.startsWith("image/")) return null;
    const bytes = await imgRes.arrayBuffer();
    const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("prompt", prompt);
    form.append("n", "1");
    form.append("size", "1024x1024");
    form.append("image", new Blob([bytes], { type: mime }), `print.${ext}`);

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) {
      console.warn(`[imageGeneration] OpenAI edits failed: ${response.status}`);
      return null;
    }
    return readImageUrl((await response.json()) as { data?: Array<{ url?: string; b64_json?: string }> });
  } catch (err) {
    console.warn("[imageGeneration] Edits error:", err);
    return null;
  }
}

async function tryImageGenerations(apiKey: string, prompt: string): Promise<string | null> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    console.warn(`[imageGeneration] OpenAI request failed: ${response.status}`);
    return null;
  }

  return readImageUrl((await response.json()) as { data?: Array<{ url?: string; b64_json?: string }> });
}

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const sourceUrl = input.originalImages?.[0]?.url;

  // No provider configured — do not pretend the print crop is a mockup.
  if (!apiKey) {
    return placeholder();
  }

  try {
    if (sourceUrl) {
      const edited = await tryImageEdits(apiKey, input.prompt, sourceUrl);
      if (edited) return generated(edited, sourceUrl);
    }

    const fromText = await tryImageGenerations(apiKey, input.prompt);
    if (fromText) return generated(fromText, sourceUrl);
    return placeholder();
  } catch (err) {
    console.warn("[imageGeneration] Provider error:", err);
    return placeholder();
  }
}
