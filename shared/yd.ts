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
  /** Extra YD storefront style names (e.g. Joey Short for Biker Short). */
  styleAliases?: string[];
  /** Extra YD URL slugs that identify this style. */
  styleSlugs?: string[];
}

/**
 * YD storefront names/slugs that mean the same catalog style.
 * Joey Short is YD's name for Biker Short — not Nonstop Short.
 */
const STYLE_YD_EQUIVALENTS: Record<string, { names: string[]; slugs: string[] }> = {
  "biker short": {
    names: ["Biker Short", "Joey Short", "The Joey Yoga Short"],
    slugs: ["biker-short", "biker-shorts", "the-joey-yoga-short", "biker-joey-short"],
  },
  "nonstop short": {
    names: ["Nonstop Short", "Non-Stop Short"],
    slugs: ["non-stop-short", "nonstop-short"],
  },
  "ready or knot tank": {
    names: ["Ready Or Knot Tank", "Ready or Knot Tank", "Reversible Knot Top"],
    slugs: ["ready-or-knot-tank", "reversible-knot-top"],
  },
  "free range bra": {
    names: ["Free Range Bra", "Free Range Sports Bra"],
    slugs: ["free-range-sports-bra"],
  },
};

function uniqueStrings(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => !!value && value.length > 0))];
}

/** Search q= variants. Print-first is the app default; style-first finds SKUs SFCC ranks poorly. */
export function searchQueryVariants(
  styleName: string,
  printName: string,
  query?: string
): string[] {
  return uniqueStrings([query, `${printName} ${styleName}`, `${styleName} ${printName}`]);
}

function styleEquivalentKey(styleName: string): string {
  return tokenizeName(styleName).join(" ");
}

function styleCandidates(identity: YdSearchIdentity): { names: string[]; slugs: string[] } {
  const builtin = STYLE_YD_EQUIVALENTS[styleEquivalentKey(identity.styleName)] ?? {
    names: [identity.styleName],
    slugs: identity.styleUrlSlug ? [identity.styleUrlSlug] : [],
  };
  return {
    names: uniqueStrings([identity.styleName, ...builtin.names, ...(identity.styleAliases ?? [])]),
    slugs: uniqueStrings([identity.styleUrlSlug, ...builtin.slugs, ...(identity.styleSlugs ?? [])]),
  };
}

function styleNameMatches(stylePart: string, candidateName: string): boolean {
  const catalogTokens = tokenizeName(candidateName);
  const styleTokens = tokenizeName(stylePart);
  const tokenMatch =
    catalogTokens.length > 0 && catalogTokens.every((token) => styleTokens.includes(token));

  const catalogCompact = compactAlnum(candidateName);
  const styleCompact = compactAlnum(stylePart);
  const compactMatch =
    catalogCompact.length > 0 &&
    (catalogCompact === styleCompact || styleCompact.includes(catalogCompact));

  return tokenMatch || compactMatch;
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
  const { names, slugs } = styleCandidates(identity);
  const slugMatch = slugs.some((slug) => slugAppearsInUrl(hit.productUrl, slug));

  if (!hit.productName) return slugMatch;

  const { stylePart } = splitStyleAndPrint(hit.productName);
  const nameMatch = names.some((name) => styleNameMatches(stylePart, name));
  return nameMatch || slugMatch;
}

function printMatchesIdentity(hit: YdSearchHit, identity: YdSearchIdentity): boolean {
  const slug = identity.printUrlName?.toLowerCase() ?? "";
  const slugMatch = slug.length >= 4 && slugAppearsInUrl(hit.productUrl, slug);

  if (!hit.productName) return slugMatch;

  const { printPart } = splitStyleAndPrint(hit.productName);
  const want = compactAlnum(identity.printName);
  const got = compactAlnum(printPart);
  const nameMatch = want.length >= 4 && want === got;
  return nameMatch || slugMatch;
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
