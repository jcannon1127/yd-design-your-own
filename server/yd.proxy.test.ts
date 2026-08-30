import { beforeEach, describe, expect, it, vi } from "vitest";
import { createContext } from "./_core/context";
import { appRouter } from "./routers";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const SAMPLE_SEARCH_HTML = `
<html>
<body>
  <div class="product-tile">
    <a href="/shop/bottoms/flower-child-printed-bell-bottoms.html">
      <img src="https://www.yogademocracy.com/dw/image/v2/BLZZ_PRD/on/demandware.static/-/Sites-yd-products/default/abc123/Original_Bell_-_Flower_Child.png?sw=400&amp;q=80" />
    </a>
  </div>
  <div data-name="Original Bell - Flower Child"></div>
</body>
</html>
`;

const SAMPLE_PRODUCT_HTML = `
<span class="product-id">flower-child-printed-bell-bottoms</span>
<div data-name="Original Bell - Flower Child"></div>
<div class="row" data-attr="size">
  <div class="col-8">
    <label class="size">Select Size</label>
    <select class="custom-select form-control select-size">
      <option value="null">Select Size</option>
      <option value="https://example.com?size=XS" data-attr-value="XS">XS</option>
      <option value="null" data-attr-value="L" disabled>L</option>
    </select>
  </div>
</div>
`;

describe("yd.searchProduct", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns imageUrl and productUrl when search succeeds", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => SAMPLE_SEARCH_HTML,
    });

    const caller = appRouter.createCaller(createContext());
    const result = await caller.yd.searchProduct({
      query: "Flower Child Original Bell",
      styleName: "Original Bell",
      printName: "Flower Child",
      styleUrlSlug: "original-bell",
      printUrlName: "flower-child",
    });

    expect(result.imageUrl).toContain("yogademocracy.com/dw/image");
    expect(result.imageUrl).toContain("sw=800");
    expect(result.productUrl).toBe(
      "https://www.yogademocracy.com/shop/bottoms/flower-child-printed-bell-bottoms.html"
    );
    expect(result.productId).toBe("flower-child-printed-bell-bottoms");
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
    ).rejects.toThrow("YD request failed: 503");
  });

  it("rejects empty query strings", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.yd.searchProduct({ query: "" })).rejects.toThrow();
  });

  it("does not return the first search hit when it is a different style+print", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => `
        <html><body>
          <div class="product" data-pid="om-tank-in-ghost-leopard">
            <a href="/shop/tops/om-tank-in-ghost-leopard.html">
              <img src="https://www.yogademocracy.com/dw/image/v2/BLZZ_PRD/on/demandware.static/-/Sites-yd-products/default/abc/ghost.jpg?sw=400&amp;q=80" alt="Om Tank - Ghost Leopard" />
            </a>
            <div data-name="Om Tank - Ghost Leopard"
                 data-url="https://www.yogademocracy.com/shop/tops/om-tank-in-ghost-leopard.html"></div>
          </div>
          <div class="product" data-pid="reversible-knot-top-in-rawr-talent">
            <a href="/shop/tops/reversible-knot-top-in-rawr-talent.html">
              <img src="https://www.yogademocracy.com/dw/image/v2/BLZZ_PRD/on/demandware.static/-/Sites-yd-products/default/def/rawr.jpg?sw=400&amp;q=80" alt="Ready or Knot Tank - Rawr Talent" />
            </a>
            <div data-name="Ready or Knot Tank - Rawr Talent"
                 data-url="https://www.yogademocracy.com/shop/tops/reversible-knot-top-in-rawr-talent.html"></div>
          </div>
        </body></html>
      `,
    });

    const caller = appRouter.createCaller(createContext());
    const result = await caller.yd.searchProduct({
      query: "Wildcat Free Range Bra",
      styleName: "Free Range Bra",
      printName: "Wildcat",
      styleUrlSlug: "free-range-sports-bra",
      printUrlName: "wildcat",
    });

    expect(result.productUrl).toBeNull();
    expect(result.productName).toBeNull();
    expect(result.imageUrl).toBeNull();
  });
});

describe("yd.getProductDetails", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns sizes and product metadata from a product page", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => SAMPLE_PRODUCT_HTML,
    });

    const caller = appRouter.createCaller(createContext());
    const result = await caller.yd.getProductDetails({
      productUrl:
        "https://www.yogademocracy.com/shop/bottoms/flower-child-printed-bell-bottoms.html",
    });

    expect(result.productId).toBe("flower-child-printed-bell-bottoms");
    expect(result.attributes[0].options).toHaveLength(2);
    expect(result.attributes[0].options[0].available).toBe(true);
    expect(result.attributes[0].options[1].available).toBe(false);
  });

  it("rejects non-YD product URLs", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.yd.getProductDetails({ productUrl: "https://example.com/product.html" })
    ).rejects.toThrow("Product URL must be on yogademocracy.com");
  });
});
