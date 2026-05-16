import { generateImage } from "./_core/imageGeneration";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

// ─── YD PROXY ROUTER ──────────────────────────────────────────────────────────
// Fetches product search pages from yogademocracy.com server-side to avoid CORS.
// Returns the first product image URL and product page URL found in the results.

const ydProxyRouter = router({
  searchProduct: publicProcedure
    .input(z.object({ query: z.string().min(1).max(200) }))
    .query(async ({ input }) => {
      const searchUrl = `https://www.yogademocracy.com/search?q=${encodeURIComponent(input.query)}`;

      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`YD search failed: ${response.status}`);
      }

      const html = await response.text();

      // Extract the first product image from the SFCC CDN
      const imgMatch = html.match(
        /src="(https:\/\/www\.yogademocracy\.com\/dw\/image\/v2\/[^"]*Sites-yd-products[^"]*?)"/
      );
      const imageUrl = imgMatch
        ? imgMatch[1]
            .replace(/&amp;/g, "&")
            .replace(/sw=\d+/, "sw=800")
            .replace(/q=\d+/, "q=85")
        : null;

      // Extract the first product page URL (handles both absolute and relative paths)
      const urlMatch = html.match(
        /href="((?:https:\/\/www\.yogademocracy\.com)?\/shop\/[^"]*\.html)"/
      );
      let productUrl: string | null = null;
      if (urlMatch) {
        const raw = urlMatch[1].replace(/&amp;/g, "&");
        productUrl = raw.startsWith("http") ? raw : `https://www.yogademocracy.com${raw}`;
      }

      return { imageUrl, productUrl };
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

      // Build a detailed prompt that describes the garment and instructs the AI
      // to apply the print pattern to it realistically
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

      return { imageUrl: result.url ?? null };
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
