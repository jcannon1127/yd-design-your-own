/**
 * Shared types and URL helpers for Yoga Democracy (SFCC) integration.
 */

export interface YdSizeOption {
  value: string;
  label: string;
  available: boolean;
}

export interface YdProductAttribute {
  id: string;
  label: string;
  options: YdSizeOption[];
}

export interface YdProductDetails {
  productId: string;
  productName: string | null;
  productUrl: string;
  imageUrl: string | null;
  price: number | null;
  salePrice: number | null;
  attributes: YdProductAttribute[];
}

export interface YdSearchResult {
  imageUrl: string | null;
  productUrl: string | null;
  productId: string | null;
  productName: string | null;
}

/** One product tile parsed from a YD search results page. */
export interface YdSearchHit {
  imageUrl: string | null;
  productUrl: string;
  productId: string | null;
  productName: string | null;
}

/**
 * Catalog style+print identity. Prefer these fields from client/src/lib/data.ts
 * over whatever YD's search ranks first.
 */
export interface YdSearchIdentity {
  styleName: string;
  printName: string;
  styleUrlSlug?: string;
  printUrlName?: string;
}

const EMPTY_SEARCH_RESULT: YdSearchResult = {
  imageUrl: null,
  productUrl: null,
  productId: null,
  productName: null,
};

/** Strip parenthetical notes such as `(28")` from catalog style names. */
function stripParens(value: string): string {
  return value.replace(/\([^)]*\)/g, " ");
}

/** Lowercase alphanumeric-only form: "Star Dust" and "Stardust" both become "stardust". */
export function compactAlnum(value: string): string {
  return stripParens(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Significant word tokens, dropping lone digits (e.g. inseam 28). */
export function tokenizeName(value: string): string[] {
  return stripParens(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !/^\d+$/.test(token));
}

function splitStyleAndPrint(productName: string): { stylePart: string; printPart: string } {
  const parts = productName.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) {
    return { stylePart: parts[0], printPart: parts.slice(1).join(" - ") };
  }
  return { stylePart: productName, printPart: productName };
}

function slugAppearsInUrl(url: string, slug: string): boolean {
  const haystack = url.toLowerCase();
  const needle = slug.toLowerCase();
  if (!needle) return false;
  return (
    haystack.includes(`/${needle}.`) ||
    haystack.includes(`/${needle}-`) ||
    haystack.includes(`-${needle}.`) ||
    haystack.includes(`-${needle}-`)
  );
}

function styleMatchesIdentity(hit: YdSearchHit, identity: YdSearchIdentity): boolean {
  const slug = identity.styleUrlSlug?.toLowerCase() ?? "";
  if (!hit.productName) {
    return !!slug && slugAppearsInUrl(hit.productUrl, slug);
  }

  const { stylePart } = splitStyleAndPrint(hit.productName);
  const catalogTokens = tokenizeName(identity.styleName);
  const styleTokens = tokenizeName(stylePart);
  const tokenMatch =
    catalogTokens.length > 0 &&
    catalogTokens.every((token) => styleTokens.includes(token));

  const catalogCompact = compactAlnum(identity.styleName);
  const styleCompact = compactAlnum(stylePart);
  const compactMatch =
    catalogCompact.length > 0 &&
    (catalogCompact === styleCompact || styleCompact.includes(catalogCompact));

  const slugAsName =
    !!slug && tokenizeName(slug).every((token) => styleTokens.includes(token));

  return tokenMatch || compactMatch || slugAsName;
}

function printMatchesIdentity(hit: YdSearchHit, identity: YdSearchIdentity): boolean {
  const slug = identity.printUrlName?.toLowerCase() ?? "";
  if (!hit.productName) {
    return slug.length >= 4 && slugAppearsInUrl(hit.productUrl, slug);
  }

  const { printPart } = splitStyleAndPrint(hit.productName);
  const want = compactAlnum(identity.printName);
  const got = compactAlnum(printPart);
  return want.length >= 4 && want === got;
}

/** True only when the hit is the selected style AND the selected print. */
export function hitMatchesIdentity(hit: YdSearchHit, identity: YdSearchIdentity): boolean {
  return styleMatchesIdentity(hit, identity) && printMatchesIdentity(hit, identity);
}

/** Pick the catalog-matching hit, or null — never a different product. */
export function pickMatchingSearchHit(
  hits: YdSearchHit[],
  identity: YdSearchIdentity
): YdSearchHit | null {
  return hits.find((hit) => hitMatchesIdentity(hit, identity)) ?? null;
}

export function searchHitToResult(hit: YdSearchHit | null): YdSearchResult {
  if (!hit) return { ...EMPTY_SEARCH_RESULT };
  return {
    imageUrl: hit.imageUrl,
    productUrl: hit.productUrl,
    productId: hit.productId,
    productName: hit.productName,
  };
}

/** Build a YD product page URL with size/length pre-selected via SFCC dwvar params. */
export function buildProductPageUrl(
  productUrl: string,
  productId: string,
  selections: Record<string, string>
): string {
  const url = new URL(productUrl);
  for (const [attrId, value] of Object.entries(selections)) {
    url.searchParams.set(`dwvar_${productId}_${attrId}`, value);
  }
  return url.toString();
}

/** Whether all required attributes have a selection and the selected options are in stock. */
export function isReadyForCheckout(
  attributes: YdProductAttribute[],
  selections: Record<string, string>
): boolean {
  if (attributes.length === 0) return false;
  return attributes.every((attr) => {
    const selected = selections[attr.id];
    if (!selected) return false;
    const option = attr.options.find((o) => o.value === selected);
    return option?.available ?? false;
  });
}
