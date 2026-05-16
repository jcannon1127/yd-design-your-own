import { beforeEach, describe, expect, it, vi } from "vitest";
import { createContext } from "./_core/context";
import { appRouter } from "./routers";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const SAMPLE_HTML = `
<html>
<body>
  <div class="product-tile">
    <a href="/shop/bottoms/flower-child-printed-bell-bottoms.html">
      <img src="https://www.yogademocracy.com/dw/image/v2/BLZZ_PRD/on/demandware.static/-/Sites-yd-products/default/abc123/Original_Bell_-_Flower_Child.png?sw=400&amp;q=80" />
    </a>
  </div>
</body>
</html>
`;

describe("yd.searchProduct", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns imageUrl and productUrl when search succeeds", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => SAMPLE_HTML,
    });

    const caller = appRouter.createCaller(createContext());
    const result = await caller.yd.searchProduct({ query: "Flower Child Original Bell" });

    expect(result.imageUrl).toContain("yogademocracy.com/dw/image");
    expect(result.imageUrl).toContain("sw=800"); // resolution upgraded
    expect(result.imageUrl).toContain("q=85"); // quality upgraded
    expect(result.imageUrl).not.toContain("&amp;"); // HTML entities decoded
    expect(result.productUrl).toBe(
      "https://www.yogademocracy.com/shop/bottoms/flower-child-printed-bell-bottoms.html"
    );
  });

  it("returns null imageUrl and productUrl when no products found", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "<html><body><p>No results found</p></body></html>",
    });

    const caller = appRouter.createCaller(createContext());
    const result = await caller.yd.searchProduct({ query: "Nonexistent Print Style" });

    expect(result.imageUrl).toBeNull();
    expect(result.productUrl).toBeNull();
  });

  it("throws when the YD search request fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
    });

    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.yd.searchProduct({ query: "Flower Child Original Bell" })
    ).rejects.toThrow("YD search failed: 503");
  });

  it("rejects empty query strings", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.yd.searchProduct({ query: "" })).rejects.toThrow();
  });
});
