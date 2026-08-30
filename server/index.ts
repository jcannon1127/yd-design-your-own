/**
 * Express host for tRPC + (when dist/ exists) the Vite SPA.
 *
 * Local `npm run dev` / `npm run dev:api`:
 *   Vite serves the client on :5173 and proxies /api/* here (PORT=3001).
 *
 * Production `npm start` / Docker:
 *   This process serves both the built SPA (dist/) and tRPC on PORT
 *   (default 3040). Bind HOST (default 0.0.0.0). Do not use :80/:443 —
 *   Caddy on the VPS reverse-proxies:
 *
 *     dyo.thisisus.ai {
 *       reverse_proxy 127.0.0.1:3040
 *     }
 *
 * Vercel production is unchanged: api/trpc/[trpc].ts + vercel.json rewrites.
 */
import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createContext } from "./_core/context";
import { appRouter } from "./routers";

const FRAME_ANCESTORS =
  "frame-ancestors 'self' https://www.yogademocracy.com https://yogademocracy.com";

export const DEFAULT_PORT = 3040;
export const DEFAULT_HOST = "0.0.0.0";

export function resolveDistDir(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
}

export function createApp(options?: { distDir?: string }) {
  const app = express();
  const distDir = options?.distDir ?? resolveDistDir();

  app.set("trust proxy", 1);

  app.use((_req, res, next) => {
    res.setHeader("Content-Security-Policy", FRAME_ANCESTORS);
    next();
  });

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

  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir, { index: false }));
    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      if (req.path.startsWith("/api/")) return next();
      res.sendFile(path.join(distDir, "index.html"), (err) => {
        if (err) next(err);
      });
    });
  }

  return app;
}

export function resolveListenAddress(env: NodeJS.ProcessEnv = process.env) {
  const port = Number(env.PORT ?? DEFAULT_PORT);
  const host = env.HOST ?? DEFAULT_HOST;

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT: ${env.PORT ?? ""}`);
  }
  if (port === 80 || port === 443) {
    throw new Error(
      "This process must not bind :80 or :443. Set PORT to a high port (e.g. 3040) and let Caddy terminate TLS."
    );
  }

  return { port, host };
}

export function start(env: NodeJS.ProcessEnv = process.env) {
  const { port, host } = resolveListenAddress(env);
  const app = createApp();
  return app.listen(port, host, () => {
    console.log(`[dyo] listening on http://${host}:${port}`);
  });
}

const isDirectRun =
  !!process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  start();
}
