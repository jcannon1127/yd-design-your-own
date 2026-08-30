# YD Design Your Own

Interactive customizer for Yoga Democracy: pick a style, pick a print, see a live preview, click through to yogademocracy.com.

Design language: **Atelier** — warm cream (#FAF7F2), deep olive (#3D4A2E), terracotta (#C4622D), Cormorant Garamond + Jost.

## Stack

- **Frontend:** React 19, Vite, Tailwind 4, Framer Motion, Wouter
- **Backend:** tRPC 11, Express (local dev and VPS) / Vercel Functions (backup)
- **Deploy:** VPS behind Caddy (`https://dyo.thisisus.ai`) — Vercel remains the backup (`https://yd-design-your-own.vercel.app`)

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

This runs the Vite dev server on `http://localhost:5173` and the tRPC API on `http://localhost:3001`. Vite proxies `/api/*` to the API.

## Tests

```bash
npm test
```

## Build for production

```bash
npm run build
```

Outputs to `dist/`. The Vercel deploy automatically runs this.

## Production on the VPS (primary)

```bash
npm ci
npm run build
PORT=3040 HOST=127.0.0.1 npm start
```

Serves the SPA + tRPC on port **3040**. Do not bind `:80` or `:443` — Caddy reverse-proxies `dyo.thisisus.ai` to `127.0.0.1:3040`. See [HOSTING.md](./HOSTING.md) for Docker and the Caddy site block.

## Deploying (Vercel backup)

See [DEPLOY.md](./DEPLOY.md). The Vercel function export is unchanged.

## Launch (start here)

See [LAUNCH.md](./LAUNCH.md) for the step-by-step checklist to get this in front of customers.

## Commercial launch

See [COMMERCIAL.md](./COMMERCIAL.md) for the roadmap to make this revenue-ready on yogademocracy.com.

## Project structure

```
client/         Vite + React frontend
  src/
    pages/      Home (the customizer) + NotFound
    lib/        data.ts (66 prints catalog), trpc client, utils
    hooks/      useProductImage (YD product image fetcher)
    components/ ErrorBoundary
server/         Express dev server + shared tRPC router
  _core/        tRPC setup, AI provider stub
  routers.ts    YD proxy router + AI mockup router
api/            Vercel serverless function entry (production)
  trpc/[trpc].ts
shared/         Code shared between client + server
```

## Adding an AI mockup provider

The `/api/aiMockup.generate` route is wired and live in the UI. When `OPENAI_API_KEY` is unset, `generateImage` returns the input print swatch with `fallback: true`. The UI shows that swatch without an AI Preview badge. This is not a garment compositor.
