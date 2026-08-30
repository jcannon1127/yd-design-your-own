import { describe, expect, it } from "vitest";
import { acceptGeneratedMockup, resolveAiPreviewUrl } from "./mockup";

const SWATCH = "https://cdn.example/print-coral-reef.jpg";
const MOCKUP = "https://cdn.example/generated-bell-coral-reef.png";

describe("acceptGeneratedMockup", () => {
  it("rejects a missing or empty generated URL", () => {
    expect(acceptGeneratedMockup(null, SWATCH)).toBeNull();
    expect(acceptGeneratedMockup(undefined, SWATCH)).toBeNull();
    expect(acceptGeneratedMockup("", SWATCH)).toBeNull();
  });

  it("rejects the input print swatch so it cannot wear an AI Preview badge", () => {
    expect(acceptGeneratedMockup(SWATCH, SWATCH)).toBeNull();
  });

  it("keeps a distinct generated garment URL", () => {
    expect(acceptGeneratedMockup(MOCKUP, SWATCH)).toBe(MOCKUP);
  });

  it("keeps a generated URL when no source was provided", () => {
    expect(acceptGeneratedMockup(MOCKUP, null)).toBe(MOCKUP);
  });
});

describe("resolveAiPreviewUrl", () => {
  it("returns null when the server marks the result as a placeholder", () => {
    expect(resolveAiPreviewUrl({ imageUrl: SWATCH, fallback: true }, SWATCH)).toBeNull();
    expect(resolveAiPreviewUrl({ imageUrl: null, fallback: true }, SWATCH)).toBeNull();
  });

  it("returns null when imageUrl is the print crop even if fallback was omitted", () => {
    expect(resolveAiPreviewUrl({ imageUrl: SWATCH }, SWATCH)).toBeNull();
  });

  it("returns a generated garment URL only when fallback is false", () => {
    expect(resolveAiPreviewUrl({ imageUrl: MOCKUP, fallback: false }, SWATCH)).toBe(MOCKUP);
  });
});
