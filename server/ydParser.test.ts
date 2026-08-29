import { describe, expect, it } from "vitest";
import { parseProductHtml, parseSearchHtml } from "./ydParser";

const SEARCH_HTML = `
<html><body>
  <div class="product-tile">
    <a href="/shop/bottoms/flower-child-printed-bell-bottoms.html">
      <img src="https://www.yogademocracy.com/dw/image/v2/BLZZ_PRD/on/demandware.static/-/Sites-yd-products/default/abc123/Original_Bell_-_Flower_Child.png?sw=400&amp;q=80" />
    </a>
  </div>
  <div data-name="Original Bell - Flower Child"></div>
</body></html>
`;

const PRODUCT_HTML = `
<span class="product-id">flower-child-printed-bell-bottoms</span>
<div data-name="Original Bell - Flower Child"></div>
<img src="https://www.yogademocracy.com/dw/image/v2/BLZZ_PRD/on/demandware.static/-/Sites-yd-products/default/abc/Original_Bell_-_Flower_Child.png?sw=400&amp;q=80" />
<div class="row" data-attr="size">
  <div class="col-8">
    <label class="size" for="size-1">Select Size</label>
    <select class="custom-select form-control select-size" id="size-1">
      <option value="null">Select Size</option>
      <option value="https://example.com?dwvar_pid_size=XS" data-attr-value="XS">XS</option>
      <option value="https://example.com?dwvar_pid_size=M" data-attr-value="M">M</option>
      <option value="null" data-attr-value="L" disabled>L</option>
    </select>
  </div>
</div>
`;

describe("parseSearchHtml", () => {
  it("extracts image, product URL, and product metadata", () => {
    const result = parseSearchHtml(SEARCH_HTML);
    expect(result.imageUrl).toContain("sw=800");
    expect(result.productUrl).toBe(
      "https://www.yogademocracy.com/shop/bottoms/flower-child-printed-bell-bottoms.html"
    );
    expect(result.productId).toBe("flower-child-printed-bell-bottoms");
    expect(result.productName).toBe("Original Bell - Flower Child");
  });
});

describe("parseProductHtml", () => {
  it("extracts product id, sizes, and availability", () => {
    const result = parseProductHtml(
      PRODUCT_HTML,
      "https://www.yogademocracy.com/shop/bottoms/flower-child-printed-bell-bottoms.html"
    );

    expect(result.productId).toBe("flower-child-printed-bell-bottoms");
    expect(result.productName).toBe("Original Bell - Flower Child");
    expect(result.attributes).toHaveLength(1);
    expect(result.attributes[0].options.map((o) => o.value)).toEqual(["XS", "M", "L"]);
    expect(result.attributes[0].options.find((o) => o.value === "M")?.available).toBe(true);
    expect(result.attributes[0].options.find((o) => o.value === "L")?.available).toBe(false);
  });
});
