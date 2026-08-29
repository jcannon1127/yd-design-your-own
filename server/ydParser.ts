import type {
  YdProductAttribute,
  YdProductDetails,
  YdSearchHit,
  YdSearchIdentity,
  YdSearchResult,
} from "../shared/yd";
import { pickMatchingSearchHit, searchHitToResult } from "../shared/yd";

const YD_ORIGIN = "https://www.yogademocracy.com";

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeProductUrl(raw: string): string {
  const decoded = decodeHtml(raw);
  return decoded.startsWith("http") ? decoded : `${YD_ORIGIN}${decoded}`;
}

function upgradeImageUrl(imageUrl: string): string {
  return imageUrl.replace(/sw=\d+/, "sw=800").replace(/q=\d+/, "q=85");
}

const SHOP_PATH_RE = /(?:https:\/\/www\.yogademocracy\.com)?\/shop\/[^"#?]+\.html/i;
const PRODUCT_IMG_RE =
  /src="(https:\/\/www\.yogademocracy\.com\/dw\/image\/v2\/[^"]*Sites-yd-products[^"]*?)"/i;

function productIdFromUrl(productUrl: string): string | null {
  return productUrl.match(/\/([^/]+)\.html$/)?.[1] ?? null;
}

function extractImage(block: string): string | null {
  const imgMatch = block.match(PRODUCT_IMG_RE);
  return imgMatch ? upgradeImageUrl(decodeHtml(imgMatch[1])) : null;
}

function extractName(block: string): string | null {
  const nameMatch =
    block.match(/data-name="([^"]+)"/i) ??
    block.match(/<a class="link"[^>]*>([^<]+)<\/a>/i) ??
    block.match(/alt="([^"]+)"/i);
  return nameMatch ? decodeHtml(nameMatch[1]).trim() : null;
}

function addHit(byUrl: Map<string, YdSearchHit>, hit: YdSearchHit): void {
  const existing = byUrl.get(hit.productUrl);
  if (!existing) {
    byUrl.set(hit.productUrl, hit);
    return;
  }
  byUrl.set(hit.productUrl, {
    productUrl: existing.productUrl,
    productId: existing.productId ?? hit.productId,
    productName: existing.productName ?? hit.productName,
    imageUrl: existing.imageUrl ?? hit.imageUrl,
  });
}

/**
 * Extract every unique shop product from a YD search results page.
 * Tiles are parsed as discrete blocks so a neighboring product cannot
 * donate its name or image.
 */
export function parseSearchHits(html: string): YdSearchHit[] {
  const byUrl = new Map<string, YdSearchHit>();

  const pairRe =
    /data-name="([^"]+)"[\s\S]{0,400}?data-url="([^"]+)"|data-url="([^"]+)"[\s\S]{0,400}?data-name="([^"]+)"/gi;
  let pair: RegExpExecArray | null;
  while ((pair = pairRe.exec(html)) !== null) {
    const name = decodeHtml(pair[1] ?? pair[4] ?? "").trim();
    const rawUrl = pair[2] ?? pair[3] ?? "";
    if (!name || !SHOP_PATH_RE.test(rawUrl)) continue;
    const productUrl = normalizeProductUrl(rawUrl);
    addHit(byUrl, {
      productUrl,
      productId: productIdFromUrl(productUrl),
      productName: name,
      imageUrl: null,
    });
  }

  const tileStarts = [...html.matchAll(/<div class="product" data-pid="([^"]+)">/gi)];
  for (let i = 0; i < tileStarts.length; i++) {
    const start = tileStarts[i].index ?? 0;
    const end = tileStarts[i + 1]?.index ?? html.length;
    const block = html.slice(start, Math.min(end, start + 8000));
    const pid = tileStarts[i][1];
    const hrefMatch = block.match(
      /href="((?:https:\/\/www\.yogademocracy\.com)?\/shop\/[^"#?]+\.html)"/i
    );
    if (!hrefMatch) continue;
    addHit(byUrl, {
      productUrl: normalizeProductUrl(hrefMatch[1]),
      productId: pid,
      productName: extractName(block),
      imageUrl: extractImage(block),
    });
  }

  if (byUrl.size === 0) {
    const hrefRe = /href="((?:https:\/\/www\.yogademocracy\.com)?\/shop\/[^"#?]+\.html)"/gi;
    let hrefMatch: RegExpExecArray | null;
    while ((hrefMatch = hrefRe.exec(html)) !== null) {
      const productUrl = normalizeProductUrl(hrefMatch[1]);
      const start = Math.max(0, hrefMatch.index - 400);
      const end = Math.min(html.length, hrefMatch.index + hrefMatch[0].length + 800);
      const block = html.slice(start, end);
      addHit(byUrl, {
        productUrl,
        productId: productIdFromUrl(productUrl),
        productName: extractName(block),
        imageUrl: extractImage(block),
      });
    }
  }

  return [...byUrl.values()];
}

/**
 * Parse YD search HTML and return the product that matches the selected
 * style+print identity. Never returns a different product's URL.
 *
 * Identity is required to emit a productUrl. A lone first hit (even on a
 * single-result page) is not treated as success — that is how
 * Flower Child + Free Range Bra used to deep-link to Limitless Sports Bra.
 */
export function parseSearchHtml(html: string, identity?: YdSearchIdentity): YdSearchResult {
  const hits = parseSearchHits(html);
  if (!identity) return searchHitToResult(null);
  return searchHitToResult(pickMatchingSearchHit(hits, identity));
}

function parseSelectOptions(selectHtml: string): YdProductAttribute["options"] {
  const options: YdProductAttribute["options"] = [];
  const optionRegex =
    /<option\b([^>]*)>([\s\S]*?)<\/option>/gi;

  let match: RegExpExecArray | null;
  while ((match = optionRegex.exec(selectHtml)) !== null) {
    const attrs = match[1];
    const label = match[2].replace(/\s+/g, " ").trim();
    const valueMatch = attrs.match(/data-attr-value="([^"]*)"/);
    if (!valueMatch) continue;

    const value = decodeHtml(valueMatch[1]);
    if (!value || label.toLowerCase() === "select size" || label.toLowerCase().includes("select ")) {
      continue;
    }

    const disabled = /\bdisabled\b/i.test(attrs);
    const valueAttr = attrs.match(/\bvalue="([^"]*)"/)?.[1] ?? "";
    const unavailable = disabled || valueAttr === "null";

    options.push({
      value,
      label,
      available: !unavailable,
    });
  }

  return options;
}

function parseAttributeBlock(attrId: string, blockHtml: string): YdProductAttribute | null {
  const labelMatch =
    blockHtml.match(new RegExp(`<label[^>]*class="${attrId}"[^>]*>\\s*([^<]+)`, "i")) ??
    blockHtml.match(/<label[^>]*>\s*([^<]+)/i);
  const label = labelMatch?.[1]?.trim() ?? attrId;

  const selectMatch = blockHtml.match(/<select[^>]*class="[^"]*select-[^"]*"[^>]*>([\s\S]*?)<\/select>/i);
  if (!selectMatch) return null;

  const options = parseSelectOptions(selectMatch[0]);
  if (options.length === 0) return null;

  return { id: attrId, label, options };
}

/** Parse a YD product detail page for checkout metadata. */
export function parseProductHtml(html: string, productUrl: string): YdProductDetails {
  const productId =
    html.match(/<span class="product-id">([^<]+)<\/span>/)?.[1]?.trim() ??
    html.match(/data-product-id="([^"]+)"/)?.[1] ??
    productUrl.match(/\/([^/]+)\.html$/)?.[1] ??
    "";

  const productName = html.match(/data-name="([^"]+)"/)?.[1]
    ? decodeHtml(html.match(/data-name="([^"]+)"/)![1])
    : null;

  const imgMatch = html.match(
    /src="(https:\/\/www\.yogademocracy\.com\/dw\/image\/v2\/[^"]*Sites-yd-products[^"]*?)"/i
  );
  const imageUrl = imgMatch ? upgradeImageUrl(decodeHtml(imgMatch[1])) : null;

  const priceMatch = html.match(/class="[^"]*sales[^"]*"[^>]*>\s*\$?([\d,.]+)/i);
  const listMatch = html.match(/class="[^"]*strike[^"]*"[^>]*>\s*\$?([\d,.]+)/i);
  const salePrice = priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : null;
  const price = listMatch ? Number(listMatch[1].replace(/,/g, "")) : salePrice;

  const attributes: YdProductAttribute[] = [];
  const attrBlockRegex = /<div class="row" data-attr="([^"]+)">([\s\S]*?)<\/div>\s*<\/div>/gi;
  let attrMatch: RegExpExecArray | null;
  while ((attrMatch = attrBlockRegex.exec(html)) !== null) {
    const parsed = parseAttributeBlock(attrMatch[1], attrMatch[2]);
    if (parsed) attributes.push(parsed);
  }

  // Fallback: grab the first size select if attribute blocks weren't found.
  if (attributes.length === 0) {
    const sizeSelect = html.match(/<select[^>]*class="[^"]*select-size[^"]*"[^>]*>([\s\S]*?)<\/select>/i);
    if (sizeSelect) {
      const options = parseSelectOptions(sizeSelect[0]);
      if (options.length > 0) {
        attributes.push({ id: "size", label: "Size", options });
      }
    }
  }

  return {
    productId,
    productName,
    productUrl,
    imageUrl,
    price,
    salePrice,
    attributes,
  };
}
