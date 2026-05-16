/**
 * tRPC context. The customizer is public, so the context is intentionally tiny.
 * Add request-scoped data here (e.g. user, request id) if you ever need it.
 */
export interface TrpcContext {
  // empty for now — placeholder for future per-request data
}

export function createContext(): TrpcContext {
  return {};
}
