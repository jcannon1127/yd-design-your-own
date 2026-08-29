import type { YdProductAttribute, YdProductDetails, YdSearchResult } from "../shared/yd";

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

/** Parse YD search results HTML for the first matching product. */
export function parseSearchHtml(html: string): YdSearchResult {
  const imgMatch = html.match(
    /src="(https:\/\/www\.yogademocracy\.com\/dw\/image\/v2\/[^"]*Sites-yd-products[^"]*?)"/
  );
  const imageUrl = imgMatch ? upgradeImageUrl(decodeHtml(imgMatch[1])) : null;

  const urlMatch = html.match(
    /href="((?:https:\/\/www\.yogademocracy\.com)?\/shop\/[^"]*\.html)"/
  );
  const productUrl = urlMatch ? normalizeProductUrl(urlMatch[1]) : null;

  let productId: string | null = null;
  let productName: string | null = null;

  if (productUrl) {
    const slugMatch = productUrl.match(/\/([^/]+)\.html$/);
    productId = slugMatch?.[1] ?? null;
  }

  const nameMatch = html.match(/data-name="([^"]+)"/);
  if (nameMatch) {
    productName = decodeHtml(nameMatch[1]);
  }

  return { imageUrl, productUrl, productId, productName };
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
