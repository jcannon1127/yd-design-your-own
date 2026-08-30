# Deploying YD Design Your Own to Vercel

**Primary host is the VPS** at `https://dyo.thisisus.ai` (see [HOSTING.md](./HOSTING.md)). Vercel stays as the backup (`https://yd-design-your-own.vercel.app`). This file is the Vercel path only.

This is the step-by-step. Total time the first time: about 15 minutes.

## Prerequisites

- A **GitHub** account (you have one).
- A **Vercel** account — sign up at https://vercel.com/signup and choose "Continue with GitHub" so the two are linked from the start.
- Node 20.11 or newer on your local machine (only needed if you want to run the app locally first; not required for the deploy itself).

## Step 1 — Push the code to GitHub

In Terminal, from this project folder:

```bash
git init
git add .
git commit -m "Initial: YD Design Your Own"
```

Now create an empty repo on GitHub (https://github.com/new):

- Name it whatever you want, e.g. `yd-design-your-own`.
- Keep it **Private** if you'd prefer.
- Do **not** initialize with a README, .gitignore, or license — the repo here already has those.

GitHub will show you a `git remote add` command on the next screen. Paste it, then push:

```bash
git remote add origin git@github.com:YOUR_USERNAME/yd-design-your-own.git
git branch -M main
git push -u origin main
```

## Step 2 — Import the repo into Vercel

1. Go to https://vercel.com/new.
2. Find the repo you just pushed and click **Import**.
3. Vercel will auto-detect the framework. Verify these settings (they should already match `vercel.json`):
   - **Framework Preset:** Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Leave Environment Variables empty for v1 (the AI mockup falls back to the swatch when no key is set).
5. Click **Deploy**.

Vercel will install dependencies, run `npm run build`, and deploy the static client + the `/api/trpc/[trpc]` Edge Function. First build takes ~90 seconds. You'll get a URL like `https://yd-design-your-own.vercel.app` — open it and you're live.

## Step 3 — Verify the live site

Hit your `.vercel.app` URL. You should see:

- Hero with the cream/olive/terracotta "Design Your Own" headline.
- Clicking **Start Designing** drops you into the three-column customizer.
- Picking a style + a print fetches the real product photo from yogademocracy.com via the proxy.
- The **Shop This Look on YD.com** button links to the live product page.
- The **Share** button copies a deep link.

If you see a broken preview image but the button works, the proxy is fine but the search miss-matched — that's expected for combos that don't exist on YD.com.

## Step 4 — Custom domain (optional)

To put this at `design.yogademocracy.com`:

1. In Vercel project → **Settings** → **Domains** → **Add** → enter `design.yogademocracy.com`.
2. Vercel will tell you to add a CNAME record pointing to `cname.vercel-dns.com`. Do that in your DNS provider (likely whoever hosts yogademocracy.com — GoDaddy, Cloudflare, Route 53, etc.).
3. DNS propagation: a few minutes typically. Vercel issues an SSL cert automatically.

## Step 5 — Enable AI mockup previews (optional)

The "Generate AI Preview" button is wired and live, but currently returns the print swatch as a placeholder.

To enable real AI mockups with OpenAI:

1. Get an API key at https://platform.openai.com/api-keys (~$5 in starter credit is plenty for testing — each generation costs about $0.04).
2. In Vercel → project → **Settings** → **Environment Variables**:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** your key
   - **Environments:** Production, Preview, Development (all three)
3. **Redeploy** (Deployments tab → top deployment → **⋯** → **Redeploy**).

Want a different provider (Anthropic, Stability, Replicate)? Edit `server/_core/imageGeneration.ts` — the file is set up as a single function with a clear plug point.

## Continuous deployment

You're now wired for git-push deploys. Every push to `main` triggers a production deploy. Every PR gets a preview URL automatically. To make a change:

```bash
# edit files
git add .
git commit -m "your message"
git push
```

Vercel deploys in ~60 seconds.

## Running locally (optional)

If you want to develop on your own machine:

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173. The Vite dev server is on 5173, the tRPC API on 3001 (Vite proxies `/api/*` to it).

## Troubleshooting

**Build fails on Vercel with "Cannot find module"** — make sure `package.json` and `package-lock.json` are both committed.

**`/api/trpc/...` returns 404 on the deployed site** — verify that `api/trpc/[trpc].ts` exists at the project root in the GitHub repo. Vercel needs that exact path.

**Preview images don't load** — the YD proxy fetches from yogademocracy.com. If they ever change their search HTML structure, edit the regex in `server/routers.ts` (the `imgMatch` and `urlMatch` lines).

**Local dev shows the page but tRPC calls 404** — make sure both `vite` and `tsx watch server/index.ts` are running. `npm run dev` runs them both with `concurrently`.

**TypeScript errors after pulling new packages** — run `npm install && npm run check`.
