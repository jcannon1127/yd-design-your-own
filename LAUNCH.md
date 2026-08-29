# Launch Checklist — YD Design Your Own

Get this in front of customers in one sitting. Do the steps in order.

---

## Step 1 — Merge & deploy (you: ~10 min)

### A. Code is ready
- [x] Commerce checkout flow merged to `main`
- [x] Build + tests pass (`npm test && npm run build`)

### B. Deploy on Vercel
1. Go to **[vercel.com/new](https://vercel.com/new)** → sign in with GitHub
2. Import **`jcannon1127/yd-design-your-own`**
3. Confirm settings (auto-detected from `vercel.json`):
   - Build: `npm run build`
   - Output: `dist`
4. Click **Deploy** — wait ~90 seconds
5. Open the `.vercel.app` URL and click through the customizer

**No env vars required for v1.** Skip `OPENAI_API_KEY` unless you want AI previews.

### C. Custom domain
1. Vercel project → **Settings** → **Domains** → Add **`design.yogademocracy.com`**
2. In your DNS provider (wherever yogademocracy.com is managed), add:

   | Type  | Name   | Value                 |
   |-------|--------|-----------------------|
   | CNAME | design | cname.vercel-dns.com  |

3. Wait for SSL (usually 2–10 min). Vercel shows a green check when ready.

### D. Smoke test
```bash
npm run smoke-test -- https://design.yogademocracy.com
```

Or manually: pick **Original Bell** + **Flower Child** → select size **M** → click **Add to Cart on YD.com** → confirm YD product page opens with size pre-selected.

---

## Step 2 — Put it on yogademocracy.com (you: ~15 min)

Pick **one** to start (nav link is fastest):

### Option A — Nav link (recommended)
Add to your SFCC site header/nav:
- **Label:** Design Your Own
- **URL:** `https://design.yogademocracy.com`

### Option B — Homepage CTA
Banner or hero button linking to `https://design.yogademocracy.com`  
Suggested copy: *"Design Your Own — pick your style, pick your print."*

### Option C — Embedded page
Create a content page at `/design-your-own` with:

```html
<iframe
  src="https://design.yogademocracy.com/?embed=1"
  title="Design Your Own — Yoga Democracy"
  style="width:100%;min-height:900px;border:none;"
  loading="lazy"
></iframe>
```

---

## Step 3 — Tell customers (optional, same day)

- [ ] Email / Instagram post announcing "Design Your Own"
- [ ] Pin a story with a screen recording of the customizer
- [ ] Share a design link: `https://design.yogademocracy.com/?design=1&style=original-bell&print=flower-child`

---

## What I need from you

| Item | Why | Who has it |
|------|-----|------------|
| **Vercel account** linked to GitHub | Deploy the app | You (5-min signup) |
| **DNS access** for yogademocracy.com | Point `design.` subdomain | You or your web host |
| **SFCC admin** (Business Manager) | Add nav link or content page | You or your agency |
| **Optional:** GA4 property ID | Track customizer → purchase funnel | Your marketing setup |

You do **not** need SFCC API keys, OpenAI, or a database for launch.

---

## After launch (week 2+)

See [COMMERCIAL.md](./COMMERCIAL.md) for:
- SFCC OCAPI true in-app add-to-cart
- Listing the 13 CUSTOM prints as real products
- Analytics events
- Catalog auto-sync from SFCC

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Preview image blank | That style+print combo may not exist on YD.com — try Flower Child + Original Bell |
| Sizes don't load | Check `/api/trpc/yd.getProductDetails` in browser Network tab; YD HTML may have changed |
| iframe blocked on YD.com | `vercel.json` already sets `frame-ancestors` for yogademocracy.com — redeploy if you changed domains |
| CUSTOM print has no cart | Expected — those prints aren't in SFCC yet; shows "Request This Print" |
