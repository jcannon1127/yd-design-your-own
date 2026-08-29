import { describe, expect, it } from "vitest";
import { parseProductHtml, parseSearchHits, parseSearchHtml } from "./ydParser";

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

const MULTI_HIT_HTML = `
<html><body>
  <div class="product" data-pid="om-tank-in-ghost-leopard">
    <div class="product-tile js-product-tile">
      <a class="image-container-link" href="/shop/tops/om-tank-in-ghost-leopard.html">
        <img src="https://www.yogademocracy.com/dw/image/v2/blzz_PRD/on/demandware.static/-/Sites-yd-products/default/dw1/1607_GhostLeopard_Front.jpg?sw=400&amp;q=80"
             alt="Om Tank - Ghost Leopard" />
      </a>
      <div class="pdp-link">
        <a class="link" href="/shop/tops/om-tank-in-ghost-leopard.html">Om Tank - Ghost Leopard</a>
      </div>
    </div>
    <div data-product-id="om-tank-in-ghost-leopard"
         data-name="Om Tank - Ghost Leopard"
         data-url="https://www.yogademocracy.com/shop/tops/om-tank-in-ghost-leopard.html"></div>
  </div>
  <div class="product" data-pid="free-range-sports-bra-in-hot-tropic">
    <div class="product-tile js-product-tile">
      <a class="image-container-link" href="/shop/tops/free-range-sports-bra-in-hot-tropic.html">
        <img src="https://www.yogademocracy.com/dw/image/v2/blzz_PRD/on/demandware.static/-/Sites-yd-products/default/dw2/1504_HotTropic_Front.jpg?sw=400&amp;q=80"
             alt="Free Range Sports Bra - Hot Tropic" />
      </a>
      <div class="pdp-link">
        <a class="link" href="/shop/tops/free-range-sports-bra-in-hot-tropic.html">Free Range Sports Bra - Hot Tropic</a>
      </div>
    </div>
    <div data-product-id="free-range-sports-bra-in-hot-tropic"
         data-name="Free Range Sports Bra - Hot Tropic"
         data-url="https://www.yogademocracy.com/shop/tops/free-range-sports-bra-in-hot-tropic.html"></div>
  </div>
</body></html>
`;

const BRA_WILDCAT_LIVE_HTML = `
<html><body>
  <div class="product" data-pid="om-tank-in-ghost-leopard">
    <a href="/shop/tops/om-tank-in-ghost-leopard.html">
      <img src="https://www.yogademocracy.com/dw/image/v2/blzz_PRD/on/demandware.static/-/Sites-yd-products/default/dw1/ghost.jpg?sw=400&amp;q=80"
           alt="Om Tank - Ghost Leopard" />
    </a>
    <div data-name="Om Tank - Ghost Leopard"
         data-url="https://www.yogademocracy.com/shop/tops/om-tank-in-ghost-leopard.html"></div>
  </div>
  <div class="product" data-pid="reversible-knot-top-in-rawr-talent">
    <a href="/shop/tops/reversible-knot-top-in-rawr-talent.html">
      <img src="https://www.yogademocracy.com/dw/image/v2/blzz_PRD/on/demandware.static/-/Sites-yd-products/default/dw2/rawr.jpg?sw=400&amp;q=80"
           alt="Ready or Knot Tank - Rawr Talent" />
    </a>
    <div data-name="Ready or Knot Tank - Rawr Talent"
         data-url="https://www.yogademocracy.com/shop/tops/reversible-knot-top-in-rawr-talent.html"></div>
  </div>
</body></html>
`;

const BRA_WILDCAT_IDENTITY = {
  styleName: "Free Range Bra",
  printName: "Wildcat",
  styleUrlSlug: "free-range-sports-bra",
  printUrlName: "wildcat",
};

describe("parseSearchHtml", () => {
  it("extracts image, product URL, and product metadata", () => {
    const result = parseSearchHtml(SEARCH_HTML, {
      styleName: "Original Bell",
      printName: "Flower Child",
      styleUrlSlug: "original-bell",
      printUrlName: "flower-child",
    });
    expect(result.imageUrl).toContain("sw=800");
    expect(result.productUrl).toBe(
      "https://www.yogademocracy.com/shop/bottoms/flower-child-printed-bell-bottoms.html"
    );
    expect(result.productId).toBe("flower-child-printed-bell-bottoms");
    expect(result.productName).toBe("Original Bell - Flower Child");
  });

  it("still extracts a single-result page without identity", () => {
    const result = parseSearchHtml(SEARCH_HTML);
    expect(result.productUrl).toBe(
      "https://www.yogademocracy.com/shop/bottoms/flower-child-printed-bell-bottoms.html"
    );
  });

  it("picks the catalog-matching tile when it is not the first search hit", () => {
    const result = parseSearchHtml(MULTI_HIT_HTML, {
      styleName: "Free Range Bra",
      printName: "Hot Tropic",
      styleUrlSlug: "free-range-sports-bra",
      printUrlName: "hot-tropic",
    });
    expect(result.productUrl).toBe(
      "https://www.yogademocracy.com/shop/tops/free-range-sports-bra-in-hot-tropic.html"
    );
    expect(result.productName).toBe("Free Range Sports Bra - Hot Tropic");
    expect(result.imageUrl).toContain("1504_HotTropic_Front.jpg");
  });

  it("returns no-match for Free Range Bra + Wildcat instead of Om Tank Ghost Leopard", () => {
    const firstHit = parseSearchHits(BRA_WILDCAT_LIVE_HTML)[0];
    expect(firstHit.productUrl).toContain("om-tank-in-ghost-leopard");

    const result = parseSearchHtml(BRA_WILDCAT_LIVE_HTML, BRA_WILDCAT_IDENTITY);
    expect(result.productUrl).toBeNull();
    expect(result.productId).toBeNull();
    expect(result.productName).toBeNull();
    expect(result.imageUrl).toBeNull();
  });

  it("returns no-match when multiple hits exist and no identity is provided", () => {
    const result = parseSearchHtml(MULTI_HIT_HTML);
    expect(result.productUrl).toBeNull();
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
