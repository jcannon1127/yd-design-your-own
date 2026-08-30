import { describe, expect, it } from "vitest";
import { acceptGeneratedMockup } from "./mockup";

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
