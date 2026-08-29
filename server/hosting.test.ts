import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { createApp, resolveListenAddress } from "./index";

const servers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((err) => (err ? reject(err) : resolve()));
        })
    )
  );
});

async function listen(app: ReturnType<typeof createApp>): Promise<string> {
  const server = app.listen(0, "127.0.0.1");
  servers.push(server);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

describe("resolveListenAddress", () => {
  it("defaults to PORT 3040 on 0.0.0.0", () => {
    expect(resolveListenAddress({})).toEqual({ port: 3040, host: "0.0.0.0" });
  });

  it("reads PORT and HOST from env", () => {
    expect(resolveListenAddress({ PORT: "3040", HOST: "127.0.0.1" })).toEqual({
      port: 3040,
      host: "127.0.0.1",
    });
  });

  it("refuses :80 and :443 so Caddy keeps the public ports", () => {
    expect(() => resolveListenAddress({ PORT: "80" })).toThrow(/must not bind/);
    expect(() => resolveListenAddress({ PORT: "443" })).toThrow(/must not bind/);
  });
});

describe("createApp hosting adapter", () => {
  it("serves /api/health", async () => {
    const base = await listen(createApp({ distDir: "/tmp/yd-dyo-missing-dist" }));
    const res = await fetch(`${base}/api/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("content-security-policy")).toContain("yogademocracy.com");
  });

  it("keeps tRPC on /api/trpc (same path the client calls)", async () => {
    const base = await listen(createApp({ distDir: "/tmp/yd-dyo-missing-dist" }));
    const res = await fetch(`${base}/api/trpc/doesNotExist`);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error?: { json?: { message?: string } } };
    expect(body.error?.json?.message ?? JSON.stringify(body)).toMatch(/no procedure/i);
  });

  it("falls back non-api GET routes to index.html like vercel.json", async () => {
    const distDir = fs.mkdtempSync(path.join(os.tmpdir(), "yd-dyo-dist-"));
    fs.writeFileSync(path.join(distDir, "index.html"), "<!doctype html><title>DYO</title>");

    const base = await listen(createApp({ distDir }));
    const root = await fetch(`${base}/`);
    expect(root.status).toBe(200);
    expect(await root.text()).toContain("DYO");

    const deep = await fetch(`${base}/not-a-file`);
    expect(deep.status).toBe(200);
    expect(await deep.text()).toContain("DYO");

    const apiMiss = await fetch(`${base}/api/missing`);
    expect(apiMiss.status).toBe(404);
  });
});
