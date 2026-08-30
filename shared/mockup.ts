/**
 * AI mockup URL hygiene.
 *
 * `aiMockup.generate` must never treat the input print crop as a generated
 * garment. When the provider is missing or echoes the source image, the UI
 * shows an honest non-AI fallback — no "AI Preview" badge on a raw swatch.
 */

/** Keep a generated URL only when it is a real mockup, not the source print. */
export function acceptGeneratedMockup(
  generatedUrl: string | null | undefined,
  sourceImageUrl: string | null | undefined
): string | null {
  if (!generatedUrl) return null;
  if (sourceImageUrl && generatedUrl === sourceImageUrl) return null;
  return generatedUrl;
}
