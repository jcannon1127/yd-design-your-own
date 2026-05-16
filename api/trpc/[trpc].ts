/**
 * Vercel serverless function: tRPC entry point.
 *
 * In production this handles every /api/trpc/* request. Locally we use the
 * Express server in server/index.ts instead (npm run dev:api).
 */
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "../../server/_core/context";
import { appRouter } from "../../server/routers";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error(`[tRPC ${path}]`, error);
    },
  });
}
