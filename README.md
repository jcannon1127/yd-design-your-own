# YD Design Your Own

Interactive customizer for Yoga Democracy: pick a style, pick a print, see a live preview, click through to yogademocracy.com.

Design language: **Atelier** — warm cream (#FAF7F2), deep olive (#3D4A2E), terracotta (#C4622D), Cormorant Garamond + Jost.

## Stack

- **Frontend:** React 19, Vite, Tailwind 4, Framer Motion, Wouter
- **Backend:** tRPC 11, Express (local dev) / Vercel Functions (prod)
- **Deploy:** Vercel (one-click from GitHub)

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

## Deploying

See [DEPLOY.md](./DEPLOY.md).

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

The `/api/aiMockup.generate` route is wired and live in the UI. By default it returns the input swatch as a placeholder. To enable real AI mockups, set `OPENAI_API_KEY` in your Vercel project env vars — the route uses OpenAI's `gpt-image-1` model. See `server/_core/imageGeneration.ts` to swap providers.
