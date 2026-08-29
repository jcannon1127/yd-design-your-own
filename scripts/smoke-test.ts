/**
 * Post-deploy smoke test — hits yogademocracy.com directly via the same
 * parser the production API uses. No server required.
 *
 * Usage:
 *   npm run smoke-test
 */

import { parseProductHtml, parseSearchHtml } from "../server/ydParser";

const YD_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

const COMBOS = [
  { style: "Original Bell", print: "Flower Child" },
  { style: "YD Legging (28\")", print: "Flower Child" },
  { style: "Biker Short", print: "Flower Child" },
  { style: "Free Range Bra", print: "Flower Child" },
  { style: "Ready Or Knot Tank", print: "Flower Child" },
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

async function main() {
  console.log("\nYD Design Your Own — launch smoke test");
  console.log("Testing live yogademocracy.com integration\n");

  let passed = 0;
  let failed = 0;

  for (const { style, print } of COMBOS) {
    const label = `${style} + ${print}`;
    try {
      const searchHtml = await fetchYd(
        `https://www.yogademocracy.com/search?q=${encodeURIComponent(`${print} ${style}`)}`
      );
      const search = parseSearchHtml(searchHtml);

      if (!search.productUrl) {
        fail(`${label} — no product URL in search results`);
        failed++;
        continue;
      }
      pass(`${label} → ${search.productUrl.split("/").pop()}`);

      const productHtml = await fetchYd(search.productUrl);
      const details = parseProductHtml(productHtml, search.productUrl);
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
      passed++;
    } catch (err) {
      fail(`${label} — ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  console.log(`\n${passed} checks passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
