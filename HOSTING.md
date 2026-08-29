# Hosting YD Design Your Own on the VPS (behind Caddy)

Primary public URL: **https://dyo.thisisus.ai**  
Backup (unchanged): **https://yd-design-your-own.vercel.app**

This app is a Vite SPA + tRPC. On Vercel those are split (static `dist/` + `api/trpc/[trpc].ts`). On the Nvidia-Agent VPS (`155.138.207.23`) they run as **one long-lived Node process** on a high port. Caddy already owns `:80` / `:443` — this process must not bind those ports.

## Exact start command

From a clone on the VPS:

```bash
npm ci
npm run build
PORT=3040 HOST=127.0.0.1 npm start
```

- **`npm start`** runs `tsx server/index.ts` (the existing Express host).
- **Listen:** `127.0.0.1:3040` (or `0.0.0.0:3040` if you prefer; Docker uses `0.0.0.0` inside the container).
- **Default PORT** is `3040` if unset. **Default HOST** is `0.0.0.0`.
- Setting `PORT=80` or `PORT=443` exits with an error on purpose.

Process manager example (systemd / pm2 / whatever you already use for `cursor.thisisus.ai`):

```bash
PORT=3040 HOST=127.0.0.1 NODE_ENV=production npm start
```

Local `npm run dev` is unchanged: Vite on `5173`, API on `3001`, Vite proxies `/api/*`.

## Docker (optional)

Same port, published only on loopback so Caddy can reach it and the public internet cannot:

```bash
docker compose up -d --build
# or
docker build -t yd-design-your-own .
docker run --rm -p 127.0.0.1:3040:3040 -e PORT=3040 -e HOST=0.0.0.0 yd-design-your-own
```

## What the process serves

| Path | Behavior |
|------|----------|
| `/` and any non-`/api/*` GET | `dist/index.html` (same as `vercel.json` SPA rewrite) |
| `/api/trpc/*` | tRPC (`yd.searchProduct`, `yd.getProductDetails`, `aiMockup.generate`) |
| `/api/health` | `{ "ok": true }` |

`vercel.json` is not used on the VPS. Leave it as-is so the Vercel backup keeps working.

## Caddy (ops — do not apply from this repo)

Do **not** edit the live Caddyfile as part of this app deploy. Example site block for whoever owns Caddy:

```caddy
dyo.thisisus.ai {
	reverse_proxy 127.0.0.1:3040
}
```

Cloudflare already proxies `*.thisisus.ai`. Use the **same TLS / Origin-cert stanza** as `cursor.thisisus.ai` and the other `*.thisisus.ai` sites on this VPS (copy that `tls` line or block verbatim). This process never terminates HTTPS.

DNS: `dyo.thisisus.ai` → `155.138.207.23`, proxied, same as the other hostnames.

## Verify

```bash
curl -sS http://127.0.0.1:3040/api/health
# {"ok":true}

curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3040/
# 200

# tRPC path the client already calls (invalid input → procedure error, not HTML)
curl -sS -o /dev/null -w "%{http_code}\n" "http://127.0.0.1:3040/api/trpc/yd.searchProduct"
# 400
```

After Caddy + Cloudflare: `https://dyo.thisisus.ai/` and `https://dyo.thisisus.ai/api/health`.

## Env

| Variable | Default | Notes |
|----------|---------|--------|
| `PORT` | `3040` | High port only. Never 80/443. |
| `HOST` | `0.0.0.0` | Use `127.0.0.1` for a native process behind Caddy. |
| `OPENAI_API_KEY` | unset | Optional; AI mockup still returns the swatch placeholder without it. |

No database, SFCC OCAPI, or other secrets are required.

## Vercel backup

Keep the existing Vercel project connected to `main`. Do not remove `api/trpc/[trpc].ts` or change `vercel.json` rewrites. See [DEPLOY.md](./DEPLOY.md).
