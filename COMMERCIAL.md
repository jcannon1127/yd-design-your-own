# Commercial Roadmap — YD Design Your Own

This document outlines what's done, what's shipping in this PR, and what comes next to make the customizer a revenue-generating feature on yogademocracy.com.

## Current state (MVP complete)

The customizer already delivers:
- 6 styles × 66 prints with live product photos from YD.com
- Mobile + desktop layouts with the "Atelier" brand design
- Share designs via URL (`?design=1&style=...&print=...`)
- AI preview for custom prints (placeholder without OpenAI key)

## This PR — Commerce-ready checkout flow

| Feature | What it does |
|---------|--------------|
| **Live size/inseam selection** | Fetches real availability from the YD product page (XS–3XL, inseam for leggings) |
| **Pre-selected checkout** | "Add to Cart on YD.com" deep-links with `dwvar_{pid}_size=M` so size is pre-filled |
| **Fixed product URLs** | Removed broken URL builder fallback — always uses live search results |
| **Custom print handling** | Custom prints show "Request This Print" instead of a broken cart link |
| **Embed mode** | `?embed=1` hides hero/footer for iframe embedding on yogademocracy.com |
| **Hardened proxy** | New `getProductDetails` tRPC route parses sizes, stock, and pricing from SFCC pages |

## Phase 1 — Launch (next 1–2 weeks)

### 1. Deploy to production
- [ ] Deploy to Vercel (see [DEPLOY.md](./DEPLOY.md))
- [ ] Point a subdomain: `design.yogademocracy.com` or `customize.yogademocracy.com`
- [ ] Smoke-test 10 style+print combos end-to-end (size select → YD.com cart)

### 2. Embed on main site
Add to a YD.com page (e.g. `/design-your-own`):

```html
<iframe
  src="https://design.yogademocracy.com/?embed=1"
  title="Design Your Own — Yoga Democracy"
  style="width:100%;min-height:900px;border:none;"
  loading="lazy"
></iframe>
```

Or link from nav: "Design Your Own" → standalone app.

### 3. Analytics
- [ ] Add GA4 / GTM events: `style_selected`, `print_selected`, `size_selected`, `checkout_clicked`
- [ ] Track conversion: customizer click → YD.com add-to-cart

## Phase 2 — Revenue optimization

### 4. True in-app add-to-cart (SFCC OCAPI)
The current flow sends users to YD.com with size pre-selected. For seamless checkout:
- [ ] Get SFCC OCAPI credentials (Shop API)
- [ ] Server-side `Cart-AddProduct` with selected variant SKU
- [ ] Redirect to `yogademocracy.com/cart` with item already added

This requires SFCC Business Manager access and a server-side API key (never expose in the browser).

### 5. Custom prints → real products
The 13 "CUSTOM" prints aren't on YD.com yet. To sell them:
- [ ] Create SFCC product records for each custom print × style combo
- [ ] Upload product photography (or enable AI mockup with OpenAI key)
- [ ] Remove `isNew` flag once products are live

### 6. Catalog sync
The print list in `data.ts` is hand-maintained. Long-term:
- [ ] Pull print catalog from SFCC or your "All Prints" Google Sheet
- [ ] Auto-detect new prints and seasonal availability
- [ ] Replace HTML scraping with OCAPI Product Search (more reliable)

## Phase 3 — Growth features

- [ ] Mix-and-match outfit builder (legging + bra as a set)
- [ ] Solid color tab
- [ ] "Save my design" (email capture or YD account)
- [ ] Social sharing with OG image preview
- [ ] Per-style hero banners in the customizer

## Technical debt to address

| Item | Priority | Notes |
|------|----------|-------|
| HTML scraping fragility | Medium | Works today; OCAPI is the long-term fix |
| Manus CDN asset hosting | Medium | Migrate images to YD's own CDN or SFCC |
| npm audit vulnerabilities | Low | Dev deps only; run `npm audit fix` before launch |
| AI mockup quality | Low | Needs OpenAI key + image-edit endpoint, not just text-to-image |

## Success metrics

Track these once live:
- **Customizer sessions** / week
- **Completion rate** (style + print + size selected)
- **Checkout click-through** to YD.com
- **Conversion rate** from customizer → purchase (requires GA4 cross-domain)
- **Top style + print combos** (inform inventory/marketing)

## What you need from SFCC

To unlock Phase 2, ask your SFCC agency or admin for:
1. OCAPI Shop API client ID + secret (server-side only)
2. API permissions: `products`, `search`, `baskets`, `orders` (read)
3. A webhook or feed for new print launches

---

Questions? This repo is ready to deploy. The highest-impact next step is getting it on a `design.yogademocracy.com` subdomain and linking it from your main nav.
