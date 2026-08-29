/**
 * YD Design Your Own — Product Data
 * Design Philosophy: "Atelier" — Refined Artisan Workshop
 * Warm cream (#FAF7F2) + deep olive (#3D4A2E) + terracotta (#C4622D)
 * Cormorant Garamond (display) + Jost (body)
 */

export interface Style {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  price: number;
  salePrice?: number;
  urlSlug: string; // base URL slug on yogademocracy.com
  categorySlug: string; // category in URL path
  icon: string; // emoji icon for the style selector (fallback)
  thumbnail: string; // CDN URL for the style thumbnail photo
}

export interface Print {
  code: number;
  name: string;
  urlName: string; // kebab-case name as used in product URLs
  seasonal?: boolean;
  tags?: string[];
  thumbnail?: string; // CDN URL for the print swatch image (new prints from Drive)
  isNew?: boolean; // flag for newly added prints not yet on yogademocracy.com
}

export interface ProductVariant {
  styleId: string;
  printCode: number;
  imageUrl: string;
  productUrl: string;
  available: boolean;
}

// ─── STYLES ────────────────────────────────────────────────────────────────────

export const STYLES: Style[] = [
  {
    id: "original-bell",
    sku: "1114",
    name: "Original Bell",
    category: "Bells & Flares",
    description: "The ultimate blend of fitness and fashion. Effortlessly transitions from yoga to brunch to laid-back Sundays.",
    price: 95,
    salePrice: 57,
    urlSlug: "original-bell",
    categorySlug: "bottoms",
    icon: "🔔",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/style-original-bell_5b336789.png",
  },
  {
    id: "yd-legging-28",
    sku: "1103",
    name: "YD Legging (28\")",
    category: "Bottoms",
    description: "Our classic high-rise legging in a standard 28\" inseam. The perfect everyday legging.",
    price: 88,
    urlSlug: "yd-legging-28",
    categorySlug: "bottoms",
    icon: "🩱",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/style-yd-legging_81f00faa.png",
  },
  {
    id: "biker-short",
    sku: "1304",
    name: "Biker Short",
    category: "Shorts",
    description: "High-waisted biker shorts with a flattering fit. Perfect for cycling, yoga, or everyday wear.",
    price: 68,
    urlSlug: "biker-short",
    categorySlug: "shorts",
    icon: "🚴",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/style-biker-short_7fff8321.png",
  },
  {
    id: "nonstop-short",
    sku: "1308",
    name: "Nonstop Short",
    category: "Shorts",
    description: "Our bestselling short with a comfortable high-rise waistband and a flattering length.",
    price: 72,
    urlSlug: "non-stop-short",
    categorySlug: "shorts",
    icon: "✨",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/style-nonstop-short-indieflow_3d50b9da.jpg",
  },
  {
    id: "free-range-bra",
    sku: "1504",
    name: "Free Range Bra",
    category: "Bras",
    description: "A supportive sports bra designed for freedom of movement. Stylish enough to wear as a top.",
    price: 68,
    urlSlug: "free-range-sports-bra",
    categorySlug: "bras",
    icon: "🌿",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/style-free-range-bra-stardust_6f3b7829.png",
  },
  {
    id: "ready-or-knot-tank",
    sku: "1606",
    name: "Ready Or Knot Tank",
    category: "Tanks",
    description: "A versatile tank with a signature knot detail. Pairs perfectly with any bottom.",
    price: 62,
    urlSlug: "ready-or-knot-tank",
    categorySlug: "tanks",
    icon: "🎀",
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/style-ready-or-knot-tank-botanical_ba6406d0.png",
  },
];

// ─── PRINTS ────────────────────────────────────────────────────────────────────
// All active, non-seasonal prints from the YD catalog

export const PRINTS: Print[] = [
  { code: 88,  name: "Rustica",                    urlName: "rustica" },
  { code: 117, name: "Winging Moves",              urlName: "winging-moves" },
  { code: 136, name: "Star Dust",                  urlName: "star-dust" },
  { code: 154, name: "Star Struck",                urlName: "star-struck" },
  { code: 164, name: "Clever Koi",                 urlName: "clever-koi" },
  { code: 178, name: "Warrior One",                urlName: "warrior-one" },
  { code: 179, name: "Humble Warrior",             urlName: "humble-warrior" },
  { code: 198, name: "Folklore",                   urlName: "folklore" },
  { code: 200, name: "Art Deco",                   urlName: "art-deco" },
  { code: 210, name: "Rainbow Love",               urlName: "rainbow-love" },
  { code: 211, name: "Celestial Timing",           urlName: "celestial-timing" },
  { code: 215, name: "Buggin' Out",                urlName: "buggin-out" },
  { code: 216, name: "Transformation",             urlName: "transformation" },
  { code: 218, name: "Lavender Love",              urlName: "lavender-love" },
  { code: 222, name: "Mosaic in Blue",             urlName: "mosaic-in-blue" },
  { code: 224, name: "Flower Power",               urlName: "flower-power" },
  { code: 228, name: "Double Rainbow",             urlName: "double-rainbow" },
  { code: 229, name: "Elegant Empire",             urlName: "elegant-empire" },
  { code: 231, name: "Botanical Garden",           urlName: "botanical-garden" },
  { code: 232, name: "Presence",                   urlName: "presence", seasonal: true },
  { code: 233, name: "Flower Bomb",                urlName: "flower-bomb" },
  { code: 234, name: "Flower Child",               urlName: "flower-child" },
  { code: 235, name: "Polka Dot in Crushed Cherry",urlName: "polka-dot-in-crushed-cherry" },
  { code: 236, name: "Polka Dot in Dream Cloud",   urlName: "polka-dot-in-dream-cloud" },
  { code: 237, name: "Black Polka Dot",            urlName: "black-polka-dot" },
  { code: 238, name: "Ghost Leopard",              urlName: "ghost-leopard" },
  { code: 239, name: "Pretty in Black",            urlName: "pretty-in-black" },
  { code: 240, name: "Retro Rainbow",              urlName: "retro-rainbow" },
  { code: 241, name: "Wildcat",                    urlName: "wildcat" },
  { code: 242, name: "Festival Denim",             urlName: "festival-denim" },
  { code: 243, name: "Feeling Ferntastic",         urlName: "feeling-ferntastic" },
  { code: 244, name: "Feminist News",              urlName: "feminist-news" },
  { code: 245, name: "Winging Moves",              urlName: "winging-moves" },
  // Additional prints visible on site
  { code: 0,   name: "Hot Tropic",                 urlName: "hot-tropic" },
  { code: 0,   name: "Mint To Be",                 urlName: "mint-to-be" },
  { code: 0,   name: "The Charleston",             urlName: "the-charleston" },
  { code: 0,   name: "Root Chakra",                urlName: "root-chakra" },
  { code: 0,   name: "Espresso Yourself",          urlName: "espresso-yourself" },
  { code: 0,   name: "Fun Gal",                    urlName: "fun-gal" },
  { code: 0,   name: "Green Thumb",                urlName: "green-thumb" },
  { code: 0,   name: "Pretty In Pink",             urlName: "pretty-in-pink" },
  { code: 0,   name: "Festival Denim",             urlName: "festival-denim" },
  { code: 0,   name: "Indie Flow",                 urlName: "indie-flow" },
  { code: 0,   name: "Ouroboros",                  urlName: "ouroboros" },
  { code: 0,   name: "Wisdom Seeker",              urlName: "wisdom-seeker" },
  { code: 0,   name: "Zen Water Garden",           urlName: "zen-water-garden" },
  { code: 0,   name: "Feeling Ferntastic",         urlName: "feeling-ferntastic" },
  { code: 0,   name: "Tropical Paradise",          urlName: "tropical-paradise" },
  { code: 0,   name: "Urban Camo Slate",           urlName: "urban-camo-slate" },
  { code: 0,   name: "Rad Paisley",                urlName: "rad-paisley" },
  { code: 0,   name: "River Rock",                 urlName: "river-rock" },
  { code: 0,   name: "Pedra",                      urlName: "pedra" },
  { code: 0,   name: "Curry Up",                   urlName: "curry-up" },
  { code: 0,   name: "Divine Feminine",            urlName: "divine-feminine" },
  { code: 0,   name: "Electric Flow",              urlName: "electric-flow" },
  { code: 0,   name: "Ready to Flamingle",         urlName: "ready-to-flamingle" },
  // ── NEW PRINTS (from YD artwork files — not yet on yogademocracy.com) ──────
  {
    code: 0, name: "Butterfly", urlName: "butterfly", isNew: true,
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/print-butterfly_d67aeea6.jpg",
    tags: ["colorful", "nature", "psychedelic"],
  },
  {
    code: 0, name: "Desert Goddess", urlName: "desert-goddess", isNew: true,
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/print-desert-goddess_ea28a30e.jpg",
    tags: ["earthy", "elegant", "gold"],
  },
  {
    code: 0, name: "Desert Kiss", urlName: "desert-kiss", isNew: true,
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/print-desert-kiss_72f18904.jpg",
    tags: ["blue", "birds", "folk art"],
  },
  {
    code: 0, name: "Desert Oasis", urlName: "desert-oasis", isNew: true,
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/print-desert-oasis_18d77da6.jpg",
    tags: ["landscape", "earthy", "southwest"],
  },
  {
    code: 0, name: "Dont Be a Prick", urlName: "dont-be-a-prick", isNew: true,
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/print-dont-be-a-prick_b9113d78.jpg",
    tags: ["cactus", "green", "watercolor"],
  },
  {
    code: 0, name: "Dragon", urlName: "dragon", isNew: true,
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/print-dragon_c4e49c95.jpg",
    tags: ["bold", "dark", "dragon"],
  },
  {
    code: 0, name: "Fantasia", urlName: "fantasia", isNew: true,
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/print-fantasia_6a6f61f6.jpg",
    tags: ["purple", "floral", "dreamy"],
  },
  {
    code: 0, name: "Flowerful", urlName: "flowerful", isNew: true,
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/print-flowerful_cecd5c8a.jpg",
    tags: ["floral", "night sky", "roses"],
  },
  {
    code: 0, name: "Fly by Night", urlName: "fly-by-night", isNew: true,
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/print-fly-by-night_fc795bd8.jpg",
    tags: ["dark", "dragonfly", "botanical"],
  },
  {
    code: 0, name: "Fossil Chic", urlName: "fossil-chic", isNew: true,
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/print-fossil-chic_ac5a1995.jpg",
    tags: ["dark", "dinosaur", "botanical"],
  },
  {
    code: 0, name: "Freedom Fighter", urlName: "freedom-fighter", isNew: true,
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/print-freedom-fighter_b9e21bca.jpg",
    tags: ["patriotic", "stars", "americana"],
  },
  {
    code: 0, name: "Coral Reef", urlName: "coral-reef", isNew: true,
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/print-coral-reef_5dfc29e2.jpg",
    tags: ["ocean", "coral", "colorful", "blue", "tropical"],
  },
  {
    code: 0, name: "Pool Party", urlName: "pool-party", isNew: true,
    thumbnail: "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/print-pool-party_243aab9d.jpg",
    tags: ["water", "aqua", "teal", "blue", "pool", "summer"],
  },
];

// Deduplicate prints by urlName
const seen = new Set<string>();
export const ACTIVE_PRINTS = PRINTS.filter(p => {
  if (seen.has(p.urlName)) return false;
  seen.add(p.urlName);
  return true;
});

// ─── URL BUILDERS ──────────────────────────────────────────────────────────────

/**
 * Build the product URL on yogademocracy.com for a given style + print combo.
 *
 * @deprecated Unreliable — YD product slugs don't follow a predictable pattern
 * (e.g. "flower-child-printed-bell-bottoms" not "original-bell-flower-child").
 * Always prefer the productUrl returned by the YD search proxy.
 */
export function buildProductUrl(style: Style, print: Print): string {
  return `https://www.yogademocracy.com/shop/${style.categorySlug}/${style.urlSlug}-${print.urlName}.html`;
}

/**
 * Build the product image URL from the SFCC CDN.
 * We use the yogademocracy.com demandware image CDN.
 * Pattern derived from observed URLs:
 * https://www.yogademocracy.com/dw/image/v2/BLZZ_PRD/on/demandware.static/-/Sites-yd-products/default/{hash}/{filename}?sw=800&q=80
 *
 * Since we can't know the hash, we use the search page image approach:
 * We'll fetch images dynamically from the search results or use the product page.
 * For the app, we'll use a proxy approach: fetch the product page and extract the image.
 *
 * Alternative: use the yogademocracy.com search API to get product images.
 */
export function buildSearchUrl(style: Style, print: Print): string {
  return `https://www.yogademocracy.com/search?q=${encodeURIComponent(style.name + ' ' + print.name)}`;
}

/**
 * Build a direct product image URL using the known SFCC image naming convention.
 * Based on observed patterns from the site:
 * - root-bell-black-1.png → {print-slug}-{style-short}-{number}.png
 * - We'll try common patterns and fall back gracefully.
 */
export function buildImageUrl(style: Style, print: Print, index: number = 1): string {
  // The SFCC CDN serves images at this base path
  // We construct the filename based on observed patterns
  const styleShort = getStyleShort(style.id);
  const printSlug = print.urlName;
  const filename = `${printSlug}-${styleShort}-${index}.png`;
  // We can't know the hash, so we'll use the product page URL approach
  // and let the component fetch the actual image
  return `https://www.yogademocracy.com/dw/image/v2/BLZZ_PRD/on/demandware.static/-/Sites-yd-products/default/dw000000/${filename}?sw=800&q=80`;
}

function getStyleShort(styleId: string): string {
  const map: Record<string, string> = {
    "original-bell": "bell",
    "yd-legging-28": "leggings",
    "biker-short": "biker",
    "nonstop-short": "nonstop-short",
    "free-range-bra": "free-range-bra",
    "ready-or-knot-tank": "ready-knot",
  };
  return map[styleId] || styleId;
}

// ─── STYLE CATEGORIES ──────────────────────────────────────────────────────────

export const STYLE_CATEGORIES = [
  { id: "all", label: "All Styles" },
  { id: "Bells & Flares", label: "Bells & Flares" },
  { id: "Bottoms", label: "Bottoms" },
  { id: "Shorts", label: "Shorts" },
  { id: "Bras", label: "Bras" },
  { id: "Tanks", label: "Tanks" },
];
