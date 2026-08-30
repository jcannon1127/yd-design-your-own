import { generateImage } from "./_core/imageGeneration";
import { publicProcedure, router } from "./_core/trpc";
import { acceptGeneratedMockup, type MockupGenerateResult } from "../shared/mockup";
import type { YdSearchIdentity } from "../shared/yd";
import { searchQueryVariants } from "../shared/yd";
import { parseProductHtml, pickVerifiedSearchResult } from "./ydParser";
import { z } from "zod";

const YD_FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

async function fetchYdHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: YD_FETCH_HEADERS,
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`YD request failed: ${response.status}`);
  }

  return response.text();
}

// ─── YD PROXY ROUTER ──────────────────────────────────────────────────────────
// Fetches product search pages from yogademocracy.com server-side to avoid CORS.
// Picks the tile that matches catalog style+print identity — never the first hit.

const ydProxyRouter = router({
  searchProduct: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        styleName: z.string().min(1).max(120).optional(),
        printName: z.string().min(1).max(120).optional(),
        styleUrlSlug: z.string().max(120).optional(),
        printUrlName: z.string().max(120).optional(),
        styleAliases: z.array(z.string().min(1).max(120)).max(8).optional(),
        styleSlugs: z.array(z.string().min(1).max(120)).max(8).optional(),
        printAliases: z.array(z.string().min(1).max(120)).max(8).optional(),
        printSlugs: z.array(z.string().min(1).max(120)).max(8).optional(),
      })
    )
    .query(async ({ input }) => {
      const identity: YdSearchIdentity | undefined =
        input.styleName && input.printName
          ? {
              styleName: input.styleName,
              printName: input.printName,
              styleUrlSlug: input.styleUrlSlug,
              printUrlName: input.printUrlName,
              styleAliases: input.styleAliases,
              styleSlugs: input.styleSlugs,
              printAliases: input.printAliases,
              printSlugs: input.printSlugs,
            }
          : undefined;

      const variants = identity
        ? searchQueryVariants(identity.styleName, identity.printName, input.query)
        : [input.query];

      const pages: string[] = [];
      for (const query of variants) {
        pages.push(
          await fetchYdHtml(`https://www.yogademocracy.com/search?q=${encodeURIComponent(query)}`)
        );
        if (identity) {
          const matched = pickVerifiedSearchResult(pages, identity);
          if (matched.productUrl) return matched;
        }
      }

      return identity ? pickVerifiedSearchResult(pages, identity) : { imageUrl: null, productUrl: null, productId: null, productName: null };
    }),

  getProductDetails: publicProcedure
    .input(z.object({ productUrl: z.string().url() }))
    .query(async ({ input }) => {
      if (!input.productUrl.startsWith("https://www.yogademocracy.com/")) {
        throw new Error("Product URL must be on yogademocracy.com");
      }
      const html = await fetchYdHtml(input.productUrl);
      return parseProductHtml(html, input.productUrl);
    }),
});

// ─── AI MOCKUP ROUTER ────────────────────────────────────────────────────────
// Uses the built-in image generation to create a realistic product mockup
// by compositing the print artwork onto the garment silhouette.

const aiMockupRouter = router({
  generate: publicProcedure
    .input(
      z.object({
        printName: z.string(),
        printThumbnailUrl: z.string().url(),
        styleName: z.string(),
        styleCategory: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { printName, printThumbnailUrl, styleName, styleCategory } = input;

      const garmentDesc = getGarmentDescription(styleName, styleCategory);

      const prompt = [
        `Create a professional product photo of a ${garmentDesc} yoga activewear garment`,
        `featuring the "${printName}" print pattern shown in the reference image.`,
        `The garment should be displayed on a clean white or light grey background,`,
        `folded or laid flat in a flattering product shot style.`,
        `The print pattern from the reference image should be accurately applied to the fabric.`,
        `Photorealistic, high quality, e-commerce product photography style.`,
        `No model, no mannequin — just the garment itself.`,
      ].join(" ");

      const result = await generateImage({
        prompt,
        originalImages: [
          {
            url: printThumbnailUrl,
            mimeType: "image/jpeg",
          },
        ],
      });

      const imageUrl = acceptGeneratedMockup(result.url, printThumbnailUrl);
      const payload: MockupGenerateResult = {
        imageUrl,
        fallback: result.fallback || imageUrl === null,
      };
      return payload;
    }),
});

function getGarmentDescription(styleName: string, styleCategory: string): string {
  const lower = styleName.toLowerCase();
  if (lower.includes("bell")) return "wide-leg bell-bottom yoga pant";
  if (lower.includes("legging")) return "high-rise full-length yoga legging";
  if (lower.includes("biker")) return "high-waisted biker short";
  if (lower.includes("nonstop") || lower.includes("non-stop")) return "high-rise athletic short";
  if (lower.includes("bra")) return "sports bra";
  if (lower.includes("tank")) return "knotted athletic tank top";
  return `${styleCategory.toLowerCase()} activewear`;
}

export const appRouter = router({
  yd: ydProxyRouter,
  aiMockup: aiMockupRouter,
});

export type AppRouter = typeof appRouter;
