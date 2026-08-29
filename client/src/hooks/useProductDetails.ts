/**
 * useProductDetails — fetches product image, page URL, and live size/inseam
 * availability from yogademocracy.com via the server-side YD proxy.
 */

import { trpc } from "@/lib/trpc";
import type { Style, Print } from "@/lib/data";

export function useProductDetails(style: Style | null, print: Print | null) {
  const enabled = !!(style && print && !print.isNew);

  const searchQuery = trpc.yd.searchProduct.useQuery(
    {
      query: enabled ? `${print!.name} ${style!.name}` : "",
      styleName: style?.name,
      printName: print?.name,
      styleUrlSlug: style?.urlSlug,
      printUrlName: print?.urlName,
    },
    {
      enabled,
      staleTime: 1000 * 60 * 60,
      retry: 2,
      retryDelay: 1000,
    }
  );

  const productUrl = searchQuery.data?.productUrl ?? null;

  const detailsQuery = trpc.yd.getProductDetails.useQuery(
    { productUrl: productUrl! },
    {
      enabled: enabled && !!productUrl,
      staleTime: 1000 * 60 * 15,
      retry: 1,
    }
  );

  const loading = searchQuery.isFetching || (productUrl ? detailsQuery.isFetching : false);
  const hasProduct = !!productUrl;
  const isCustomPrint = !!print?.isNew;

  return {
    imageUrl: detailsQuery.data?.imageUrl ?? searchQuery.data?.imageUrl ?? null,
    productUrl,
    productId: detailsQuery.data?.productId ?? searchQuery.data?.productId ?? null,
    productName: detailsQuery.data?.productName ?? searchQuery.data?.productName ?? null,
    price: detailsQuery.data?.price ?? style?.price ?? null,
    salePrice: detailsQuery.data?.salePrice ?? style?.salePrice ?? null,
    attributes: detailsQuery.data?.attributes ?? [],
    loading,
    error:
      isCustomPrint
        ? false
        : searchQuery.isError ||
          detailsQuery.isError ||
          (searchQuery.isSuccess && !searchQuery.data?.productUrl),
    isCustomPrint,
    hasProduct,
  };
}
