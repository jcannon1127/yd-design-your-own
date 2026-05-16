# YD Design Your Own — Design Ideas

## Context
A standalone interactive customizer for Yoga Democracy. Customers pick a style (6 styles: Original Bell, 28" Legging, Biker Short, Nonstop Short, Free Range Bra, Ready Or Knot Tank) and a print from the YD catalog, see a live product preview, and click Add to Cart linking to yogademocracy.com.

The brand is: vibrant, print-forward, sustainable, feminist, free-spirited, earthy yet colorful.

---

<response>
<text>
## Idea 1: "Studio Wall" — Editorial Mood Board Aesthetic

**Design Movement:** Post-modern editorial / fashion magazine layout
**Core Principles:**
- Asymmetric split-screen: left panel is the live preview (large, dominant), right panel is the selection interface
- Raw, tactile feel — linen-texture backgrounds, torn-edge dividers
- Typography as design element — oversized style names that bleed off-screen

**Color Philosophy:** Warm off-white (#F5F0E8) base with deep forest green (#1A3A2A) as the primary accent. Pops of the selected print's dominant color bleed into the UI chrome. Feels like a high-end yoga studio.

**Layout Paradigm:** Fixed left preview (60vw), scrollable right panel (40vw). No traditional grid — the print thumbnails are arranged in an organic masonry-style flow.

**Signature Elements:**
- Oversized step numbers ("01", "02", "03") in light gray behind section headings
- A thin horizontal rule that "bleeds" from the preview into the selector panel
- Print thumbnails with a subtle polaroid-style white border and slight rotation on hover

**Interaction Philosophy:** Selecting a print causes the preview to cross-fade with a slight scale-up. Hovering a print thumbnail reveals its name in a floating label. The Add to Cart button pulses gently.

**Animation:** Framer Motion cross-fade on image swap (300ms ease-in-out). Thumbnail hover: scale 1.05 + rotate 2deg. Step transitions: slide-in from right.

**Typography System:** Playfair Display (display/headings) + DM Sans (body/labels). Large italic "Design Your Own" hero text.
</text>
<probability>0.08</probability>
</response>

<response>
<text>
## Idea 2: "Jungle Gym" — Bold Tropical Maximalism

**Design Movement:** Neo-maximalism / Tropical brutalism
**Core Principles:**
- Full-bleed color blocks — each style gets its own bold background color
- Oversized, stacked typography that feels like protest posters
- The print IS the hero — everything else steps back

**Color Philosophy:** Deep charcoal (#1C1C1C) base with electric accent colors pulled from YD's print palette — chartreuse, coral, cerulean. The background color shifts based on the selected style category.

**Layout Paradigm:** Vertical scroll journey. Step 1 (style) takes the full viewport. Scrolling reveals Step 2 (print grid). The preview is sticky and floats in the top-right corner as you scroll through prints.

**Signature Elements:**
- Bold category labels in all-caps with a thick underline that animates in on scroll
- Print thumbnails in a tight 4-column grid with no gaps — pure color mosaic
- A floating sticky preview card (top-right) that updates in real time

**Interaction Philosophy:** Selecting a print causes the background to briefly flash the print's dominant color. The sticky preview card bounces slightly on update.

**Animation:** Background color flash (150ms). Preview card bounce (spring physics). Print grid entrance: stagger fade-in from bottom.

**Typography System:** Space Grotesk (all headings, bold/black weight) + Inter (body). Tight letter-spacing on headings.
</text>
<probability>0.07</probability>
</response>

<response>
<text>
## Idea 3: "Atelier" — Refined Artisan Workshop (CHOSEN)

**Design Movement:** Contemporary artisan / slow fashion editorial
**Core Principles:**
- Clean but warm — not sterile white, but warm cream with earthy accents
- The customizer feels like a personal styling session, not a product page
- Every interaction is deliberate and satisfying

**Color Philosophy:** Warm cream (#FAF7F2) background. Deep olive/moss (#3D4A2E) for primary text and CTAs. Terracotta (#C4622D) as the accent/highlight color. This palette echoes YD's sustainability ethos and earthy brand identity without being generic.

**Layout Paradigm:** Three-column desktop layout: narrow left sidebar (style selector), large center (live preview), right panel (print selector). On mobile, collapses to a vertical stepper. The preview is always visible — it's the anchor of the experience.

**Signature Elements:**
- Style selector as a vertical tab list with a small style silhouette icon next to each name
- Print thumbnails in a 3-column grid with the print name below each — feels like a fabric swatch book
- A "Your Design" summary strip at the bottom that shows the selected style + print + price before Add to Cart

**Interaction Philosophy:** Selecting a style slides the preview in from the left. Selecting a print cross-fades the preview image. The summary strip slides up from the bottom when both selections are made.

**Animation:** Framer Motion layout animations. Preview: cross-fade 250ms. Style switch: slide-in-left 200ms. Summary strip: slide-up spring. Print hover: subtle lift shadow.

**Typography System:** Cormorant Garamond (display headings — elegant, fashion-forward) + Jost (body/labels — clean geometric sans). The contrast between the serif display and geometric sans creates a sophisticated tension.
</text>
<probability>0.09</probability>
</response>

---

## Selected Approach: **Idea 3 — "Atelier"**

Warm cream background, deep olive primary, terracotta accent. Three-column layout (style sidebar | preview | print grid). Cormorant Garamond + Jost typography. Feels like a personal styling session.
