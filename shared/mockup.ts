/**
 * AI mockup URL hygiene.
 *
 * When no OpenAI key is set, generateImage returns the print swatch with
 * `fallback: true`. The UI may show an "AI Preview" badge only when
 * `resolveAiPreviewUrl` returns a URL — never on that swatch fallback.
 */

export interface MockupGenerateResult {
  imageUrl: string | null;
  fallback: boolean;
}

/** Keep a generated URL only when it is a real mockup, not the source print. */
export function acceptGeneratedMockup(
  generatedUrl: string | null | undefined,
  sourceImageUrl: string | null | undefined
): string | null {
  if (!generatedUrl) return null;
  if (sourceImageUrl && generatedUrl === sourceImageUrl) return null;
  return generatedUrl;
}

/** Client guard: never treat a placeholder or echoed swatch as a generated garment. */
export function resolveAiPreviewUrl(
  result: { imageUrl?: string | null; fallback?: boolean },
  sourceImageUrl?: string | null
): string | null {
  if (result.fallback) return null;
  return acceptGeneratedMockup(result.imageUrl, sourceImageUrl);
}
