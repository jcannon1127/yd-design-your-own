/**
 * Local development Express server.
 *
 * In production on Vercel, the API is served by `api/trpc/[trpc].ts` instead.
 * This file is only for `npm run dev` — it hosts the same tRPC router at
 * /api/trpc and Vite proxies /api/* to it.
 */
import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { createContext } from "./_core/context";
import { appRouter } from "./routers";

const app = express();

app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});
