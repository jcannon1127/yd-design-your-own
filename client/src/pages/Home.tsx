/**
 * YD Design Your Own — Home Page (Main Customizer)
 * Design Philosophy: "Atelier" — Refined Artisan Workshop
 *
 * Layout: Three-column desktop (style sidebar | preview | print grid)
 * Mobile: Vertical stepper
 *
 * Colors: Warm cream bg, deep olive primary, terracotta accent
 * Fonts: Cormorant Garamond (display) + Jost (body)
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STYLES, ACTIVE_PRINTS, type Style, type Print } from "@/lib/data";
import { useProductDetails } from "@/hooks/useProductDetails";
import CheckoutPanel from "@/components/CheckoutPanel";
import { trpc } from "@/lib/trpc";
import { resolveAiPreviewUrl } from "@shared/mockup";
import { ChevronDown, ExternalLink, ArrowRight, Sparkles, Loader2, Link2, Check } from "lucide-react";

// ─── HERO BANNER ──────────────────────────────────────────────────────────────

// Real YD lifestyle photography from yogademocracy.com
const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/yd-leggings-lifestyle_70e07dd6.jpg";
const YD_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/yd-logo-footer_15ece0c9.png";
const YD_LOGO_WHITE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663361994871/oK4hRXUzGUi6iyYp4VDfyQ/yd-logo-white_e43db5de.png";

// ─── PRINT THUMBNAIL ──────────────────────────────────────────────────────────

// Generate a consistent gradient color from a string
function getPrintGradient(name: string): string {
  const gradients = [
    "linear-gradient(135deg, #3D4A2E, #5B7A5E)",
    "linear-gradient(135deg, #C4622D, #E8945A)",
    "linear-gradient(135deg, #2E6B8A, #4A9AB5)",
    "linear-gradient(135deg, #7B5EA7, #A07BC4)",
    "linear-gradient(135deg, #8A6B2E, #B5944A)",
    "linear-gradient(135deg, #6B2E5E, #9A4A87)",
    "linear-gradient(135deg, #2E5E6B, #4A8A9A)",
    "linear-gradient(135deg, #5E6B2E, #8A9A4A)",
    "linear-gradient(135deg, #6B5E2E, #9A8A4A)",
    "linear-gradient(135deg, #2E4A6B, #4A6A9A)",
    "linear-gradient(135deg, #4A2E6B, #6A4A9A)",
    "linear-gradient(135deg, #6B2E2E, #9A4A4A)",
    "linear-gradient(135deg, #2E6B5E, #4A9A87)",
    "linear-gradient(135deg, #3D4A2E, #8A6B2E)",
    "linear-gradient(135deg, #C4622D, #7B5EA7)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

// ─── PRINT THUMBNAIL ─────────────────────────────────────────────────────────
// For new prints (with thumbnail CDN URL): show the swatch image directly.
// For catalog prints: fetch from YD.com via the server-side proxy.

function NewPrintThumbnail({ print }: { print: Print }) {
  return (
    <div className="relative w-full h-full">
      <img
        src={print.thumbnail!}
        alt={print.name}
        className="w-full h-full object-cover"
      />
      {/* "Custom" badge */}
      <div className="absolute top-0.5 left-0.5 px-1 py-0.5 rounded bg-accent/90">
        <span className="text-white text-[7px] font-body font-semibold">CUSTOM</span>
      </div>
    </div>
  );
}

function CatalogPrintThumbnail({ print, selectedStyle }: { print: Print; selectedStyle: Style | null }) {
  const styleName = selectedStyle?.name ?? "Original Bell";
  const query = trpc.yd.searchProduct.useQuery(
    {
      query: `${print.name} ${styleName}`,
      styleName,
      printName: print.name,
      styleUrlSlug: selectedStyle?.urlSlug,
      printUrlName: print.urlName,
      styleAliases: selectedStyle?.ydNames,
      styleSlugs: selectedStyle?.ydSlugs,
      printAliases: print.ydNames,
      printSlugs: print.ydSlugs,
    },
    { staleTime: 1000 * 60 * 60, retry: 1 }
  );

  const gradient = getPrintGradient(print.name);
  const imgSrc = query.data?.imageUrl
    ? query.data.imageUrl.replace(/sw=\d+/, "sw=200").replace(/q=\d+/, "q=70")
    : null;

  if (query.isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: gradient }}>
        <div className="w-3 h-3 border border-white/50 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!imgSrc) {
    return (
      <div
        className="w-full h-full flex items-center justify-center p-1"
        style={{ background: gradient }}
      >
        <span className="text-white/90 text-[9px] font-body text-center leading-tight">
          {print.name}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={print.name}
      className="w-full h-full object-cover"
    />
  );
}

function PrintThumbnail({ print, selectedStyle }: { print: Print; selectedStyle: Style | null }) {
  if (print.isNew && print.thumbnail) {
    return <NewPrintThumbnail print={print} />;
  }
  return <CatalogPrintThumbnail print={print} selectedStyle={selectedStyle} />;
}

// ─── CUSTOM PRINT PREVIEW ─────────────────────────────────────────────────────
// isNew prints skip YD search. generateImage may return the print swatch when
// no key is set — never put an "AI Preview" badge on that fallback.

function NewPrintPreview({ style, print }: { style: Style; print: Print }) {
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const generateMockup = trpc.aiMockup.generate.useMutation({
    onSuccess: (data) => {
      setAiImageUrl(resolveAiPreviewUrl(data, print.thumbnail));
    },
  });

  useEffect(() => {
    setAiImageUrl(null);
  }, [style.id, print.urlName]);

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="relative flex-1 overflow-hidden rounded-lg bg-secondary/20 min-h-[360px]">
        <AnimatePresence mode="wait">
          {generateMockup.isPending && (
            <motion.div
              key="ai-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="text-sm font-body text-foreground font-medium">Generating AI preview…</p>
                <p className="text-xs text-muted-foreground font-body text-center max-w-[200px]">
                  Applying {print.name} to your {style.name}
                </p>
              </div>
            </motion.div>
          )}

          {aiImageUrl && !generateMockup.isPending && (
            <motion.div key="ai-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
              <img
                src={aiImageUrl}
                alt={`${style.name} in ${print.name} — AI preview`}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-accent/90">
                <Sparkles size={10} className="text-white" />
                <span className="text-white text-[9px] font-body font-semibold">AI Preview</span>
              </div>
            </motion.div>
          )}

          {!aiImageUrl && !generateMockup.isPending && (
            <motion.div key="swatch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col">
              <div className="flex-1 overflow-hidden">
                <img
                  src={print.thumbnail!}
                  alt={`${print.name} print swatch`}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col items-center gap-2">
                <p className="text-white/80 text-xs font-body text-center">
                  This is the {print.name} print swatch
                </p>
                <button
                  onClick={() =>
                    generateMockup.mutate({
                      printName: print.name,
                      printThumbnailUrl: print.thumbnail!,
                      styleName: style.name,
                      styleCategory: style.category,
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-xs font-body font-semibold
                             hover:bg-accent/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Sparkles size={12} />
                  Generate AI Preview on {style.name}
                </button>
              </div>
            </motion.div>
          )}

          {generateMockup.isError && !generateMockup.isPending && (
            <motion.div key="ai-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute bottom-2 left-2 right-2 bg-destructive/90 rounded-md px-3 py-2">
              <p className="text-white text-xs font-body text-center">AI preview failed — try again</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product info strip */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-end justify-between">
        <div>
          <p className="font-display text-xl text-foreground">{style.name}</p>
          <p className="text-sm text-muted-foreground font-body">
            {print.name}
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">CUSTOM</span>
          </p>
        </div>
        <div className="text-right">
          {style.salePrice ? (
            <>
              <p className="text-xs text-muted-foreground line-through font-body">${style.price}</p>
              <p className="font-display text-xl text-accent">${style.salePrice}</p>
            </>
          ) : (
            <p className="font-display text-xl text-foreground">${style.price}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── PREVIEW COMPONENT ────────────────────────────────────────────────────────

function ProductPreview({ style, print, imageUrl, productUrl, loading, error }: {
  style: Style | null;
  print: Print | null;
  imageUrl: string | null;
  productUrl: string | null;
  loading: boolean;
  error: boolean;
}) {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);

  useEffect(() => {
    if (imageUrl) {
      setDisplayUrl(imageUrl);
    }
  }, [imageUrl]);

  if (!style) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-5">
          <span className="text-3xl">✨</span>
        </div>
        <h3 className="font-display text-2xl text-foreground mb-2">Your canvas awaits</h3>
        <p className="text-muted-foreground text-sm font-body">Select a style to begin designing your perfect piece</p>
      </div>
    );
  }

  if (!print) {
    return (
      <div className="flex flex-col h-full">
        {/* Style product photo fills the preview */}
        <div className="relative flex-1 overflow-hidden rounded-lg bg-secondary/20 min-h-[360px]">
          <img
            src={style.thumbnail}
            alt={style.name}
            className="w-full h-full object-cover object-top"
          />
          {/* Soft overlay with prompt */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-5">
            <p className="font-display text-2xl text-white mb-1">{style.name}</p>
            <p className="text-white/75 text-sm font-body">Now choose a print from the right →</p>
          </div>
        </div>
        {/* Info strip */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="font-display text-xl text-foreground">{style.name}</p>
            <p className="text-sm text-muted-foreground font-body">{style.category}</p>
          </div>
          <div className="text-right">
            {style.salePrice ? (
              <>
                <p className="text-xs text-muted-foreground line-through font-body">${style.price}</p>
                <p className="font-display text-xl text-accent">${style.salePrice}</p>
              </>
            ) : (
              <p className="font-display text-xl text-foreground">${style.price}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // All prints get the AI preview experience
  if (print.isNew && print.thumbnail) {
    return <NewPrintPreview style={style} print={print} />;
  }

  // Catalog prints: show the product photo with an AI Generate button overlay
  return <CatalogPrintPreview style={style} print={print} imageUrl={displayUrl} loading={loading} error={error} />;
}

// ─── CATALOG PRINT PREVIEW (with AI button) ──────────────────────────────────
function CatalogPrintPreview({ style, print, imageUrl, loading, error }: {
  style: Style;
  print: Print;
  imageUrl: string | null;
  loading: boolean;
  error: boolean;
}) {
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [showAiButton, setShowAiButton] = useState(false);
  const generateMockup = trpc.aiMockup.generate.useMutation({
    onSuccess: (data) => {
      const source = print.thumbnail ?? imageUrl;
      setAiImageUrl(resolveAiPreviewUrl(data, source));
    },
  });

  useEffect(() => {
    setAiImageUrl(null);
    setShowAiButton(false);
  }, [style.id, print.urlName]);

  useEffect(() => {
    if (imageUrl && !loading) {
      const timer = setTimeout(() => setShowAiButton(true), 800);
      return () => clearTimeout(timer);
    }
  }, [imageUrl, loading]);

  const handleGenerate = () => {
    generateMockup.mutate({
      printName: print.name,
      printThumbnailUrl: imageUrl ?? `https://placehold.co/400x400/3D4A2E/FAF7F2?text=${encodeURIComponent(print.name)}`,
      styleName: style.name,
      styleCategory: style.category,
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="relative flex-1 overflow-hidden rounded-lg bg-secondary/20 min-h-[360px]">
        <AnimatePresence mode="wait">
          {generateMockup.isPending && (
            <motion.div key="ai-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm z-10">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-sm font-body text-foreground font-medium">Generating AI preview…</p>
              <p className="text-xs text-muted-foreground font-body text-center max-w-[200px]">
                Applying {print.name} to your {style.name}
              </p>
            </motion.div>
          )}
          {aiImageUrl && !generateMockup.isPending && (
            <motion.div key="ai-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
              <img src={aiImageUrl} alt={`${style.name} in ${print.name} — AI preview`} className="w-full h-full object-contain" />
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-accent/90">
                <Sparkles size={10} className="text-white" />
                <span className="text-white text-[9px] font-body font-semibold">AI Preview</span>
              </div>
              <button onClick={handleGenerate}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           bg-black/50 backdrop-blur-sm text-white text-[10px] font-body hover:bg-black/70 transition-all">
                <Sparkles size={9} /> Regenerate
              </button>
            </motion.div>
          )}
          {loading && !generateMockup.isPending && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground font-body">Loading preview…</p>
              </div>
            </motion.div>
          )}
          {imageUrl && !aiImageUrl && !generateMockup.isPending && (
            <motion.div key="product-photo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
              <img src={imageUrl} alt={`${style.name} in ${print.name}`} className="w-full h-full object-contain" />
              <AnimatePresence>
                {showAiButton && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 flex flex-col items-center gap-2">
                    <p className="text-white/70 text-[10px] font-body text-center">See it on a different style?</p>
                    <button onClick={handleGenerate}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-xs font-body font-semibold
                                 hover:bg-accent/90 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <Sparkles size={12} /> Generate AI Preview on {style.name}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          {(error || (!loading && !imageUrl && !aiImageUrl && !generateMockup.isPending)) && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
              <div className="w-full max-w-xs aspect-[3/4] rounded-xl flex flex-col items-center justify-center gap-3"
                style={{ background: getPrintGradient(print.name), opacity: 0.85 }}>
                <span className="text-5xl">{style.icon}</span>
                <p className="font-display text-xl text-white text-center">{style.name}</p>
                <p className="text-sm text-white/80 font-body text-center">{print.name}</p>
              </div>
              <button onClick={handleGenerate}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-xs font-body font-semibold
                           hover:bg-accent/90 transition-all duration-200 shadow-lg">
                <Sparkles size={12} /> Generate AI Preview on {style.name}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-end justify-between">
        <div>
          <p className="font-display text-xl text-foreground">{style.name}</p>
          <p className="text-sm text-muted-foreground font-body">{print.name}</p>
        </div>
        <div className="text-right">
          {style.salePrice ? (
            <>
              <p className="text-xs text-muted-foreground line-through font-body">${style.price}</p>
              <p className="font-display text-xl text-accent">${style.salePrice}</p>
            </>
          ) : (
            <p className="font-display text-xl text-foreground">${style.price}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── STYLE SELECTOR ───────────────────────────────────────────────────────────

function StyleSelector({
  selected,
  onSelect,
}: {
  selected: Style | null;
  onSelect: (style: Style) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {STYLES.map((style) => (
        <button
          key={style.id}
          onClick={() => onSelect(style)}
          className={`
            w-full text-left px-4 py-3 rounded-md transition-all duration-200 font-body
            flex items-center gap-3
            ${selected?.id === style.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-secondary text-foreground"
            }
          `}
        >
          <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-secondary">
            <img
              src={style.thumbnail}
              alt={style.name}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${selected?.id === style.id ? "text-primary-foreground" : "text-foreground"}`}>
              {style.name}
            </p>
            <p className={`text-xs truncate ${selected?.id === style.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {style.category}
            </p>
          </div>
          {selected?.id === style.id && (
            <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── PRINT GRID ───────────────────────────────────────────────────────────────

function PrintGrid({
  selected,
  onSelect,
  selectedStyle,
}: {
  selected: Print | null;
  onSelect: (print: Print) => void;
  selectedStyle?: Style | null;
}) {
  const [search, setSearch] = useState("");
  const [filterCustom, setFilterCustom] = useState(false);

  const filtered = ACTIVE_PRINTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterCustom ? p.isNew === true : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-3 flex-shrink-0">
        <button
          onClick={() => setFilterCustom(false)}
          className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all duration-200 ${
            !filterCustom
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          All Prints
        </button>
        <button
          onClick={() => setFilterCustom(true)}
          className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all duration-200 flex items-center gap-1.5 ${
            filterCustom
              ? "bg-accent text-white shadow-sm"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles size={10} />
          Custom
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3 flex-shrink-0">
        <input
          type="text"
          placeholder="Search prints…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 text-sm font-body bg-background border border-border rounded-md
                     placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent
                     focus:border-accent transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground font-body mb-3 flex-shrink-0">
        {filtered.length} print{filtered.length !== 1 ? "s" : ""} available
      </p>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2 pb-4">
          {filtered.map((print) => (
            <button
              key={print.urlName}
              onClick={() => onSelect(print)}
              className={`
                relative group rounded-md overflow-hidden aspect-square
                transition-all duration-200
                ${selected?.urlName === print.urlName
                  ? "ring-2 ring-accent shadow-md"
                  : "hover:shadow-md hover:-translate-y-0.5"
                }
              `}
              title={print.name}
            >
              <PrintThumbnail print={print} selectedStyle={selectedStyle ?? null} />
              {/* Name overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-1.5">
                <p className="text-white text-[9px] font-body leading-tight">{print.name}</p>
              </div>
              {/* Selected checkmark */}
              {selected?.urlName === print.urlName && (
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center shadow-sm">
                  <span className="text-white text-[8px] font-bold">✓</span>
                </div>
              )}
              {/* Seasonal badge */}
              {print.seasonal && (
                <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/50">
                  <span className="text-white text-[7px] font-body">Seasonal</span>
                </div>
              )}
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm font-body">
            No prints found for "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DESKTOP PREVIEW PANEL ──────────────────────────────────────────────────

function DesktopPreviewPanel({
  selectedStyle,
  selectedPrint,
}: {
  selectedStyle: Style | null;
  selectedPrint: Print | null;
}) {
  const product = useProductDetails(selectedStyle, selectedPrint);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("design", "1");
    if (selectedStyle) url.searchParams.set("style", selectedStyle.id);
    if (selectedPrint) url.searchParams.set("print", selectedPrint.urlName);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [selectedStyle, selectedPrint]);

  return (
    <div className="sticky top-24">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-body uppercase tracking-widest mb-1">Preview</p>
          <h2 className="font-display text-xl text-foreground">
            {selectedStyle && selectedPrint
              ? `${selectedStyle.name} in ${selectedPrint.name}`
              : selectedStyle
              ? selectedStyle.name
              : "Your Design"}
          </h2>
        </div>
        {selectedStyle && selectedPrint && (
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium
                       bg-secondary hover:bg-secondary/80 text-foreground transition-all duration-200"
          >
            {copied ? <Check size={11} className="text-green-600" /> : <Link2 size={11} />}
            {copied ? "Copied!" : "Share"}
          </button>
        )}
      </div>

      <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm" style={{ minHeight: "520px" }}>
        <div className="p-6 h-full" style={{ minHeight: "520px" }}>
          <ProductPreview
            style={selectedStyle}
            print={selectedPrint}
            imageUrl={product.imageUrl}
            productUrl={product.productUrl}
            loading={product.loading}
            error={product.error}
          />
        </div>
      </div>

      <div className="mt-4">
        <CheckoutPanel
          style={selectedStyle}
          print={selectedPrint}
          productUrl={product.productUrl}
          productId={product.productId}
          attributes={product.attributes}
          loading={product.loading}
          isCustomPrint={product.isCustomPrint}
          hasProduct={product.hasProduct}
        />
      </div>

      {selectedStyle && (
        <motion.p
          key={selectedStyle.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-muted-foreground font-body text-center leading-relaxed"
        >
          {selectedStyle.description}
        </motion.p>
      )}
    </div>
  );
}

function HeroSection({ onStartDesigning }: { onStartDesigning: () => void }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Yoga Democracy activewear"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <a href="https://www.yogademocracy.com" target="_blank" rel="noopener noreferrer"
           className="flex items-center hover:opacity-90 transition-opacity bg-white rounded-xl px-4 py-2 shadow-lg">
          <img src={YD_LOGO} alt="Yoga Democracy" className="h-10" />
        </a>
        <a href="https://www.yogademocracy.com" target="_blank" rel="noopener noreferrer"
           className="text-white/80 text-sm font-body hover:text-white transition-colors flex items-center gap-1">
          Back to Shop <ExternalLink size={12} />
        </a>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="text-white/70 text-xs font-body uppercase tracking-[0.25em] mb-4">
            Introducing
          </p>
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl text-white leading-[1.05] mb-6">
            Design<br />
            <em>Your Own</em>
          </h1>
          <p className="text-white/80 text-base font-body max-w-sm mb-10 leading-relaxed">
            Choose your style. Pick your print. Make it uniquely yours.
            Sustainable activewear, crafted in Kenya, designed by you.
          </p>
          <button
            onClick={onStartDesigning}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-md
                       bg-white text-foreground font-body font-medium text-sm
                       hover:bg-white/90 transition-all duration-200
                       shadow-lg hover:shadow-xl"
          >
            Start Designing
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center pb-8">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-white/50"
        >
          <ChevronDown size={24} />
        </motion.div>
      </div>
    </div>
  );
}

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            i < step ? "bg-accent w-8" : i === step ? "bg-primary w-6" : "bg-border w-4"
          }`}
        />
      ))}
    </div>
  );
}

// ─── MOBILE PREVIEW WRAPPER ─────────────────────────────────────────────────

function MobilePreviewWrapper({
  selectedStyle,
  selectedPrint,
}: {
  selectedStyle: Style | null;
  selectedPrint: Print | null;
  onStartOver: () => void;
}) {
  const product = useProductDetails(selectedStyle, selectedPrint);

  return (
    <>
      <div style={{ height: "50vh" }}>
        <ProductPreview
          style={selectedStyle}
          print={selectedPrint}
          imageUrl={product.imageUrl}
          productUrl={product.productUrl}
          loading={product.loading}
          error={product.error}
        />
      </div>
      <div className="mt-6">
        <CheckoutPanel
          style={selectedStyle}
          print={selectedPrint}
          productUrl={product.productUrl}
          productId={product.productId}
          attributes={product.attributes}
          loading={product.loading}
          isCustomPrint={product.isCustomPrint}
          hasProduct={product.hasProduct}
        />
      </div>
    </>
  );
}

// ─── MOBILE STEPPER ───────────────────────────────────────────────────────────

function MobileStepper({
  selectedStyle,
  selectedPrint,
  onStyleSelect,
  onPrintSelect,
}: {
  selectedStyle: Style | null;
  selectedPrint: Print | null;
  onStyleSelect: (s: Style) => void;
  onPrintSelect: (p: Print) => void;
}) {
  const [step, setStep] = useState(0);

  const handleStyleSelect = (style: Style) => {
    onStyleSelect(style);
    setStep(1);
  };

  const handlePrintSelect = (print: Print) => {
    onPrintSelect(print);
    setStep(2);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Mobile header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <a href="https://www.yogademocracy.com" className="flex items-center hover:opacity-70 transition-opacity">
            <img src={YD_LOGO} alt="Yoga Democracy" className="h-6" />
          </a>
          <StepIndicator step={step} total={3} />
        </div>
        <p className="text-xs text-muted-foreground font-body">
          {step === 0 ? "Step 1 of 2: Choose your style" : step === 1 ? "Step 2 of 2: Choose your print" : "Your design is ready!"}
        </p>
      </div>

      <div className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-style"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="font-display text-2xl mb-4">Choose Your Style</h2>
              <StyleSelector selected={selectedStyle} onSelect={handleStyleSelect} />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div
              key="step-print"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col"
              style={{ height: "calc(100vh - 120px)" }}
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="font-display text-2xl">Choose Your Print</h2>
                <button onClick={() => setStep(0)} className="text-xs text-muted-foreground font-body hover:text-foreground">
                  ← Back
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <PrintGrid selected={selectedPrint} onSelect={handlePrintSelect} />
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step-preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl">Your Design</h2>
                <button onClick={() => setStep(1)} className="text-xs text-muted-foreground font-body hover:text-foreground">
                  ← Change Print
                </button>
              </div>
              <MobilePreviewWrapper selectedStyle={selectedStyle} selectedPrint={selectedPrint} onStartOver={() => setStep(0)} />
              <div className="mt-3 text-center">
                <button
                  onClick={() => setStep(0)}
                  className="text-xs text-muted-foreground font-body hover:text-foreground underline"
                >
                  Start over
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── DESKTOP CUSTOMIZER ───────────────────────────────────────────────────────

function DesktopCustomizer({
  selectedStyle,
  selectedPrint,
  onStyleSelect,
  onPrintSelect,
  embed = false,
}: {
  selectedStyle: Style | null;
  selectedPrint: Print | null;
  onStyleSelect: (s: Style) => void;
  onPrintSelect: (p: Print) => void;
  embed?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-20">
        <div className="container flex items-center justify-between py-4">
          <a href="https://www.yogademocracy.com" target="_blank" rel="noopener noreferrer"
             className="flex items-center hover:opacity-70 transition-opacity">
            <img src={YD_LOGO} alt="Yoga Democracy" className="h-7" />
          </a>
          <div className="text-center">
            <h1 className="font-display text-2xl italic text-foreground">Design Your Own</h1>
          </div>
          {!embed ? (
            <a href="https://www.yogademocracy.com" target="_blank" rel="noopener noreferrer"
               className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              Back to Shop <ExternalLink size={12} />
            </a>
          ) : (
            <div className="w-20" />
          )}
        </div>
      </header>

      {/* Three-column layout */}
      <div className="container py-8">
        <div className="grid grid-cols-[220px_1fr_280px] gap-8 items-start">

          {/* LEFT: Style Selector */}
          <div className="sticky top-24">
            <div className="mb-4">
              <p className="text-xs text-muted-foreground font-body uppercase tracking-widest mb-1">Step 01</p>
              <h2 className="font-display text-xl text-foreground">Choose Style</h2>
            </div>
            <StyleSelector selected={selectedStyle} onSelect={onStyleSelect} />

            {/* Sustainability note */}
            <div className="mt-6 p-3 rounded-md bg-secondary/60 border border-border">
              <p className="text-xs text-muted-foreground font-body leading-relaxed">
                <span className="text-primary font-medium">Sustainably made</span> — crafted from recycled materials in Naivasha, Kenya.
              </p>
            </div>
          </div>

          {/* CENTER: Preview — useProductImage here so both ProductPreview and AddToCartButton share the same fetch */}
          <DesktopPreviewPanel
            selectedStyle={selectedStyle}
            selectedPrint={selectedPrint}
          />

          {/* RIGHT: Print Grid */}
          <div className="sticky top-24" style={{ height: "calc(100vh - 120px)" }}>
            <div className="mb-4">
              <p className="text-xs text-muted-foreground font-body uppercase tracking-widest mb-1">Step 02</p>
              <h2 className="font-display text-xl text-foreground">Choose Print</h2>
            </div>
            <div style={{ height: "calc(100vh - 200px)" }}>
              <PrintGrid selected={selectedPrint} onSelect={onPrintSelect} selectedStyle={selectedStyle} />
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      {!embed && (
      <footer className="border-t border-border mt-16 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <img src={YD_LOGO} alt="Yoga Democracy" className="h-5 opacity-50" />
            <span className="text-sm font-body">© 2026 Yoga Democracy. Made for free range humans.</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-body text-muted-foreground">
            <a href="https://www.yogademocracy.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Shop</a>
            <a href="https://www.yogademocracy.com/about" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">About</a>
            <a href="https://www.yogademocracy.com/size-chart" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Size Chart</a>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}

// ─── MAIN HOME PAGE ───────────────────────────────────────────────────────────

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [selectedPrint, setSelectedPrint] = useState<Print | null>(null);
  const customizerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const embedMode = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("embed") === "1";
  }, []);

  const [showCustomizer, setShowCustomizer] = useState(embedMode);

  // Read URL params on mount to restore a shared design
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const styleId = params.get("style");
    const printUrlName = params.get("print");
    const openDesign = params.get("design") === "1";

    if (embedMode || openDesign || styleId) {
      const style = styleId ? STYLES.find(s => s.id === styleId) ?? null : null;
      const print = printUrlName ? ACTIVE_PRINTS.find(p => p.urlName === printUrlName) ?? null : null;
      if (style) setSelectedStyle(style);
      if (print) setSelectedPrint(print);
      setShowCustomizer(true);
      if (!embedMode) {
        setTimeout(() => {
          customizerRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }, [embedMode]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleStartDesigning = () => {
    setShowCustomizer(true);
    setTimeout(() => {
      customizerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleStyleSelect = (style: Style) => {
    setSelectedStyle(style);
    setSelectedPrint(null);
  };

  return (
    <div className={embedMode ? "embed-mode" : undefined}>
      {/* Hero — hidden in embed mode for iframe use on yogademocracy.com */}
      {!embedMode && <HeroSection onStartDesigning={handleStartDesigning} />}

      {/* Customizer */}
      <div ref={customizerRef}>
        <AnimatePresence>
          {(showCustomizer || embedMode) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {isMobile ? (
                <MobileStepper
                  selectedStyle={selectedStyle}
                  selectedPrint={selectedPrint}
                  onStyleSelect={handleStyleSelect}
                  onPrintSelect={setSelectedPrint}
                />
              ) : (
                <DesktopCustomizer
                  selectedStyle={selectedStyle}
                  selectedPrint={selectedPrint}
                  onStyleSelect={handleStyleSelect}
                  onPrintSelect={setSelectedPrint}
                  embed={embedMode}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
