/**
 * tRPC React client. The AppRouter type is imported from the server for
 * end-to-end type safety. Only the *type* crosses the boundary — no server
 * code is bundled into the client.
 */
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";

export const trpc = createTRPCReact<AppRouter>();
