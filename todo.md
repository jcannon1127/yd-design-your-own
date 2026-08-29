# YD Design Your Own — TODO

## Phase 1 (MVP)
- [x] Project initialized (React 19 + Tailwind 4 + Express + tRPC)
- [x] Upgraded to full-stack (db, server, user) for backend proxy
- [x] Hero section with editorial yoga photo and "Start Designing" CTA
- [x] Three-column desktop layout (style selector | preview | print grid)
- [x] Mobile stepper layout (step 1: style → step 2: print → step 3: preview)
- [x] Style selector with 6 styles: Original Bell, YD Legging (28"), Biker Short, Nonstop Short, Free Range Bra, Ready Or Knot Tank
- [x] Print grid with 53 prints, search filter, seasonal badges
- [x] Backend proxy route (tRPC) to fetch product images from yogademocracy.com server-side (no CORS)
- [x] Print thumbnails loaded via backend proxy with real product photos
- [x] Live preview panel showing actual product photo for selected style+print combo
- [x] Price display with sale price strikethrough
- [x] "Shop This Look on YD.com" button linking to the correct product page
- [x] Sustainability note ("crafted from recycled materials in Naivasha, Kenya")
- [x] Footer with Shop, About, Size Chart links
- [x] Vitest tests for backend proxy (5 tests passing)
- [x] TypeScript clean (zero errors)

## Phase 2 (Future)
- [ ] Mix-and-match outfit builder (e.g., print legging + solid bra as a set)
- [ ] SFCC OCAPI integration (true in-app Add to Cart without leaving customizer)
- [ ] Solid color selection tab
- [ ] Share your design / social sharing with OG image
- [x] Embed on yogademocracy.com (`?embed=1` + iframe CSP headers)

## Improvements (Round 2)
- [ ] Replace print thumbnails with actual print swatch images from Column A of the "All Prints" Google Sheet
- [ ] Add per-style hero banner image that updates when a style is selected in the customizer
- [x] Replace leaf icon with real Yoga Democracy logo
- [x] Replace stock hero image with real YD product photography
- [x] Replace emoji icons in style selector with real product photo thumbnails for each style
- [x] Fix blank logo on hero (white circle showing instead of YD emblem)
- [x] Replace 3 solid-blue style thumbnails (Nonstop Short, Free Range Bra, Ready Or Knot Tank) with colorful printed versions

## Round 3 — New Prints + AI Preview
- [x] Add 11 new prints from Google Drive with actual swatch thumbnails (Butterfly, Desert Goddess, Desert Kiss, Desert Oasis, Dont Be a Prick, Dragon, Fantasia, Flowerful, Fly by Night, Fossil Chic, Freedom Fighter)
- [x] NEW badge on all 11 new prints in the print grid
- [x] AI-powered live preview for new prints — "Generate AI Preview on [Style]" button composites print onto garment using AI image generation
- [x] Loading state with spinner and "Applying [print] to your [style]" message during AI generation
- [x] AI Preview badge on generated images

## Round 4 — AI Preview for All Prints + Fixes
- [x] Change "NEW" badge to "CUSTOM" on the 11 custom prints
- [x] Fix hero logo reverting to white (not showing YD emblem)
- [x] Enable AI preview for all 64 existing prints (use product image as swatch reference)
- [x] Update server AI mockup procedure to handle product-image-based generation for catalog prints

## Round 5 — Filter, Share, Logo Fix
- [x] Permanently fix hero logo (diagnose root cause of white logo issue)
- [x] Add CUSTOM filter tab above print grid
- [x] Share Your Design feature (URL-encoded style+print, copy link button)

## Round 6
- [x] Replace emoji/icon in center empty state with actual product photo when style is selected but no print chosen yet

## Round 7
- [x] Permanently fix hero logo visibility (switched to dark logo on solid white pill — bulletproof)

## Round 8
- [x] Add Coral Reef print from lifestyle photo as new CUSTOM option

## Round 9
- [x] Add Pool Party print from lifestyle photo as new CUSTOM option
