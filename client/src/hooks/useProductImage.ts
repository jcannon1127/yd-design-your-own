/**
 * useProductImage — fetches the product image URL and product page URL
 * for a style+print combo via the server-side YD proxy tRPC route.
 *
 * The backend fetches yogademocracy.com search results server-side,
 * eliminating all CORS issues and making image loading fast and reliable.
 */

import { trpc } from "@/lib/trpc";
import type { Style, Print } from "@/lib/data";

export function useProductImage(style: Style | null, print: Print | null) {
  const enabled = !!(style && print);

  const query = trpc.yd.searchProduct.useQuery(
    { query: enabled ? `${print!.name} ${style!.name}` : "" },
    {
      enabled,
      staleTime: 1000 * 60 * 60, // cache results for 1 hour
      retry: 2,
      retryDelay: 1000,
    }
  );

  return {
    imageUrl: query.data?.imageUrl ?? null,
    productUrl: query.data?.productUrl ?? null,
    loading: query.isFetching,
    error: query.isError || (query.isSuccess && !query.data?.imageUrl),
  };
}
