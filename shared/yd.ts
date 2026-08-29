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
