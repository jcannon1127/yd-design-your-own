import { describe, expect, it } from "vitest";
import {
  compactAlnum,
  hitMatchesIdentity,
  pickMatchingSearchHit,
  tokenizeName,
  type YdSearchHit,
  type YdSearchIdentity,
} from "./yd";

function hit(name: string, url: string): YdSearchHit {
  const slug = url.match(/\/([^/]+)\.html$/)?.[1] ?? null;
  return {
    productName: name,
    productUrl: url,
    productId: slug,
    imageUrl: null,
  };
}

const BRA_WILDCAT: YdSearchIdentity = {
  styleName: "Free Range Bra",
  printName: "Wildcat",
  styleUrlSlug: "free-range-sports-bra",
  printUrlName: "wildcat",
};

const OM_TANK_GHOST = hit(
  "Om Tank - Ghost Leopard",
  "https://www.yogademocracy.com/shop/tops/om-tank-in-ghost-leopard.html"
);
const KNOT_RAWR = hit(
  "Ready or Knot Tank - Rawr Talent",
  "https://www.yogademocracy.com/shop/tops/reversible-knot-top-in-rawr-talent.html"
);
const BELL_HOT_TROPIC = hit(
  "Original Bell - Hot Tropic",
  "https://www.yogademocracy.com/shop/bottoms/original-bell-hot-tropic.html"
);
const LEGGING_FOLKLORE = hit(
  "YD Legging - Folklore",
  "https://www.yogademocracy.com/shop/bottoms/folklore-printed-yoga-leggings.html"
);
const BRA_STARDUST = hit(
  "Free Range Sports Bra - Stardust",
  "https://www.yogademocracy.com/shop/tops/free-range-sports-bra-in-star-dust.html"
);
const BRA_HOT_TROPIC = hit(
  "Free Range Sports Bra - Hot Tropic",
  "https://www.yogademocracy.com/shop/tops/free-range-sports-bra-in-hot-tropic.html"
);
const LIMITLESS_FLOWER = hit(
  "Limitless Sports Bra - Flower Child",
  "https://www.yogademocracy.com/shop/tops/limitless-sports-bra-flower-child.html"
);
const BELL_GHOST = hit(
  "Original Bell - Ghost Leopard",
  "https://www.yogademocracy.com/shop/bottoms/ghost-leopard-printed-bell-bottoms.html"
);
const KNOT_FLOWER = hit(
  "Ready or Knot Tank - Flower Child",
  "https://www.yogademocracy.com/shop/tops/reversible-knot-top-in-flower-child.html"
);

describe("tokenizeName / compactAlnum", () => {
  it("drops parenthetical inseam notes", () => {
    expect(tokenizeName('YD Legging (28")')).toEqual(["yd", "legging"]);
  });

  it("collapses Star Dust and Stardust", () => {
    expect(compactAlnum("Star Dust")).toBe("stardust");
    expect(compactAlnum("Stardust")).toBe("stardust");
    expect(compactAlnum("star-dust")).toBe("stardust");
  });
});

describe("hitMatchesIdentity", () => {
  it("matches Original Bell + Hot Tropic", () => {
    expect(
      hitMatchesIdentity(BELL_HOT_TROPIC, {
        styleName: "Original Bell",
        printName: "Hot Tropic",
        styleUrlSlug: "original-bell",
        printUrlName: "hot-tropic",
      })
    ).toBe(true);
  });

  it("matches YD Legging (28\") + Folklore despite slug mismatch", () => {
    expect(
      hitMatchesIdentity(LEGGING_FOLKLORE, {
        styleName: 'YD Legging (28")',
        printName: "Folklore",
        styleUrlSlug: "yd-legging-28",
        printUrlName: "folklore",
      })
    ).toBe(true);
  });

  it("matches Free Range Bra + Star Dust to Free Range Sports Bra - Stardust", () => {
    expect(
      hitMatchesIdentity(BRA_STARDUST, {
        styleName: "Free Range Bra",
        printName: "Star Dust",
        styleUrlSlug: "free-range-sports-bra",
        printUrlName: "star-dust",
      })
    ).toBe(true);
  });

  it("rejects Om Tank Ghost Leopard for Free Range Bra + Wildcat", () => {
    expect(hitMatchesIdentity(OM_TANK_GHOST, BRA_WILDCAT)).toBe(false);
  });

  it("rejects Ready or Knot Rawr Talent for Free Range Bra + Wildcat", () => {
    expect(hitMatchesIdentity(KNOT_RAWR, BRA_WILDCAT)).toBe(false);
  });

  it("rejects Limitless Sports Bra when the catalog style is Free Range Bra", () => {
    expect(
      hitMatchesIdentity(LIMITLESS_FLOWER, {
        styleName: "Free Range Bra",
        printName: "Flower Child",
        styleUrlSlug: "free-range-sports-bra",
        printUrlName: "flower-child",
      })
    ).toBe(false);
  });

  it("rejects Original Bell Ghost Leopard when the print is Wildcat", () => {
    expect(
      hitMatchesIdentity(BELL_GHOST, {
        styleName: "Original Bell",
        printName: "Wildcat",
        styleUrlSlug: "original-bell",
        printUrlName: "wildcat",
      })
    ).toBe(false);
  });

  it("matches a nameless hit via style and print slugs", () => {
    expect(
      hitMatchesIdentity(
        hit("", "https://www.yogademocracy.com/shop/bottoms/original-bell-hot-tropic.html"),
        {
          styleName: "Original Bell",
          printName: "Hot Tropic",
          styleUrlSlug: "original-bell",
          printUrlName: "hot-tropic",
        }
      )
    ).toBe(true);
  });

  it("rejects Ready or Knot Tank when the catalog style is Biker Short", () => {
    expect(
      hitMatchesIdentity(KNOT_FLOWER, {
        styleName: "Biker Short",
        printName: "Flower Child",
        styleUrlSlug: "biker-short",
        printUrlName: "flower-child",
      })
    ).toBe(false);
  });
});

describe("pickMatchingSearchHit", () => {
  it("returns null when the first (and only useful) hits are the wrong product", () => {
    expect(pickMatchingSearchHit([OM_TANK_GHOST, KNOT_RAWR], BRA_WILDCAT)).toBeNull();
  });

  it("returns a later matching tile instead of the first search hit", () => {
    const picked = pickMatchingSearchHit(
      [OM_TANK_GHOST, BRA_HOT_TROPIC],
      {
        styleName: "Free Range Bra",
        printName: "Hot Tropic",
        styleUrlSlug: "free-range-sports-bra",
        printUrlName: "hot-tropic",
      }
    );
    expect(picked?.productUrl).toBe(BRA_HOT_TROPIC.productUrl);
    expect(picked?.productName).toBe("Free Range Sports Bra - Hot Tropic");
  });
});
