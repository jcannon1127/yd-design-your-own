/**
 * Post-deploy smoke test — hits yogademocracy.com directly via the same
 * parser the production API uses. No server required.
 *
 * Asserts style+print identity (name), not merely that some URL exists.
 * A first-hit URL for a different product is a failure.
 *
 * Usage:
 *   npm run smoke-test
 */

import { parseProductHtml, parseSearchHtml } from "../server/ydParser";
import type { YdSearchIdentity } from "../shared/yd";
import { hitMatchesIdentity } from "../shared/yd";

const YD_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

type Combo = YdSearchIdentity & {
  /** When true, a no-match is success (combo is not on YD). A wrong-product URL is always a failure. */
  allowNoMatch?: boolean;
  /** Substring that must appear in a resolved product URL. */
  expectUrlIncludes?: string;
};

const COMBOS: Combo[] = [
  {
    styleName: "Original Bell",
    printName: "Flower Child",
    styleUrlSlug: "original-bell",
    printUrlName: "flower-child",
    expectUrlIncludes: "flower-child",
  },
  {
    styleName: 'YD Legging (28")',
    printName: "Folklore",
    styleUrlSlug: "yd-legging-28",
    printUrlName: "folklore",
    expectUrlIncludes: "folklore-printed-yoga-leggings",
  },
  {
    styleName: "Original Bell",
    printName: "Hot Tropic",
    styleUrlSlug: "original-bell",
    printUrlName: "hot-tropic",
    expectUrlIncludes: "original-bell-hot-tropic",
  },
  {
    styleName: "Free Range Bra",
    printName: "Hot Tropic",
    styleUrlSlug: "free-range-sports-bra",
    printUrlName: "hot-tropic",
    expectUrlIncludes: "free-range-sports-bra",
  },
  {
    styleName: "Free Range Bra",
    printName: "Wildcat",
    styleUrlSlug: "free-range-sports-bra",
    printUrlName: "wildcat",
    allowNoMatch: true,
  },
  {
    styleName: "Original Bell",
    printName: "Wildcat",
    styleUrlSlug: "original-bell",
    printUrlName: "wildcat",
    allowNoMatch: true,
  },
  {
    styleName: "Free Range Bra",
    printName: "Flower Child",
    styleUrlSlug: "free-range-sports-bra",
    printUrlName: "flower-child",
    allowNoMatch: true,
  },
];

function pass(msg: string) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg: string) {
  console.log(`  ✗ ${msg}`);
}

async function fetchYd(url: string): Promise<string> {
  const res = await fetch(url, { headers: YD_HEADERS, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function identityHit(productUrl: string, productName: string | null) {
  return { productUrl, productName, productId: null, imageUrl: null };
}

async function main() {
  console.log("\nYD Design Your Own — launch smoke test");
  console.log("Testing live yogademocracy.com integration\n");

  let passed = 0;
  let failed = 0;

  for (const combo of COMBOS) {
    const label = `${combo.styleName} + ${combo.printName}`;
    try {
      const searchHtml = await fetchYd(
        `https://www.yogademocracy.com/search?q=${encodeURIComponent(`${combo.printName} ${combo.styleName}`)}`
      );
      const search = parseSearchHtml(searchHtml, combo);

      if (!search.productUrl) {
        if (combo.allowNoMatch) {
          pass(`${label} — no match (out of catalog, not a different product)`);
          passed++;
          continue;
        }
        fail(`${label} — no verified style+print match`);
        failed++;
        continue;
      }

      if (!search.productName) {
        fail(`${label} — URL without a product name (${search.productUrl.split("/").pop()})`);
        failed++;
        continue;
      }

      if (!hitMatchesIdentity(identityHit(search.productUrl, search.productName), combo)) {
        fail(`${label} — name "${search.productName}" is not ${combo.styleName} + ${combo.printName}`);
        failed++;
        continue;
      }

      if (combo.expectUrlIncludes && !search.productUrl.includes(combo.expectUrlIncludes)) {
        fail(`${label} — URL ${search.productUrl} missing ${combo.expectUrlIncludes}`);
        failed++;
        continue;
      }

      pass(`${label} → ${search.productName} (${search.productUrl.split("/").pop()})`);
      passed++;

      const productHtml = await fetchYd(search.productUrl);
      const details = parseProductHtml(productHtml, search.productUrl);

      if (!details.productName || !hitMatchesIdentity(identityHit(details.productUrl, details.productName), combo)) {
        fail(`${label} — PDP name "${details.productName}" does not match style+print`);
        failed++;
        continue;
      }
      pass(`${label} — PDP name ${details.productName}`);
      passed++;

      const attr = details.attributes[0];
      const sizeCount = attr?.options.length ?? 0;
      const inStock = attr?.options.filter((o) => o.available).length ?? 0;

      if (sizeCount === 0) {
        fail(`${label} — no sizes parsed from product page`);
        failed++;
      } else {
        pass(`${label} — ${inStock}/${sizeCount} sizes in stock (${attr!.label})`);
        passed++;
      }
    } catch (err) {
      fail(`${label} — ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  console.log(`\n${passed} checks passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
