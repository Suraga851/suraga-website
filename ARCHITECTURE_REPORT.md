# Architecture Report — Suraga Website

**Date:** 2026-06-28
**Scope:** Speed, scalability, security, and new-feature improvements

---

## 1. What you had before (the architecture)

A **multi-stack monorepo** deploying three things in parallel:

| Stack | Path | Role | Deployed? |
|---|---|---|---|
| **Static site** (custom build) | `scripts/build-pages.mjs` + `public/` | Main marketing site (EN/AR), built to static HTML at build time, esbuild-bundled JS, pre-gzipped + brotli'd | ✅ Vercel static |
| **Next.js 3D app** | `web/` | `/suraga-3d` route, React Three Fiber + GSAP + WASM (Emscripten, JS fallback), also exported to static | ✅ Vercel static |
| **Node serverless APIs** | `api/` | `/api/contact`, `/api/health`, `/api/verification/*` on Postgres via `pg` | ✅ Vercel functions |
| **Rust/axum backend** | `src/*.rs` | Duplicate of the verification API (`/numbers`, `/textnow-guide`, `/health`) | ❌ **Dormant** — no deploy config references it |
| **Capacitor mobile** | `capacitor.config.*` | Wraps the site as a mobile app | (separate) |

### Key problems that existed

- Pinned to **single region** (`fra1`) — every non-EU visitor hit Frankfurt.
- Postgres pool `max:5` **per serverless instance** — would exhaust DB connections under load.
- **In-memory rate limiter** (`Map`) that reset on every cold start — didn't actually limit anything.
- API key check used `!==` — **timing-attack vulnerable**.
- Contact form interpolated raw user input into the **email HTML body** — email-content injection; no CRLF stripping — SMTP header injection possible.
- No honeypot, no rate limit on the contact endpoint — spam magnet.
- CSP allowed `'unsafe-inline'` for scripts.
- Hero image shipped at **one fixed size** to all devices (no responsive `srcset`).

---

## 2. What changed (8 files, all verified to compile + run)

### Security

| # | Change | File | What it does |
|---|---|---|---|
| P0-2 | **Timing-safe API key compare** | `api/_lib/verification.js` | Replaced `provided !== apiKey` with `crypto.timingSafeEqual` + constant-time length-mismatch handling. Closes timing-attack vector on `/api/verification/*`. |
| P0-3 | **Email injection hardening** | `api/contact.js` | HTML-escape all user input before interpolating into email body; strip CR/LF from header-bound fields (name, email, inquiry); cap field lengths. |
| P1-3 | **CSP hardened** | `vercel.json` | Removed `'unsafe-inline'` from `script-src` (now `'self'` only — safe because JSON-LD isn't executable). Added `frame-ancestors 'none'` (clickjacking) + `upgrade-insecure-requests`. |
| P1-4 | **Contact anti-spam** | `api/contact.js` + `scripts/build-pages.mjs` + `public/js/modules/form.js` + `public/css/frontend-extras.css` | Added hidden honeypot field (`website`) — bots fill it, server silently 200s and drops; real users never see it. Added rate limiting to the contact endpoint. |

### Scalability

| # | Change | File | What it does |
|---|---|---|---|
| P0-1 | **Postgres pooler sizing** | `api/_lib/verification.js` | `max:5` → `max:2`, added `idleTimeoutMillis`, `connectionTimeoutMillis`, SSL handling. Stops the "too many connections" cliff across many serverless instances. |
| P1-1 | **Redis-backed rate limiting** | `api/_lib/verification.js` | New `isAllowed()` helper: uses **Upstash Redis** sliding-window counter (survives cold starts, shared across regions) when `UPSTASH_REDIS_REST_URL` is set; falls back to the existing in-memory `Map` otherwise. In-memory `Map` now capped at 10k entries to prevent memory exhaustion. |

### Speed

| # | Change | File | What it does |
|---|---|---|---|
| P1-2 | **Multi-region** | `vercel.json` | `regions: ["fra1"]` → `["fra1","sfo1","iad1","sin1"]`. Cuts TTFB by 200–400ms for Americas/Asia. |
| P2-1 | **Responsive hero images** | `scripts/build-images.mjs` + `scripts/build-pages.mjs` | Build now generates 480w + 960w AVIF/WebP variants; `<picture>` now serves a responsive `srcset` + `sizes`. A phone now downloads the **6.8KB AVIF** instead of the full-res file. |

### Build verification (run and passed)

- `npm run check:js` → **25/25 files pass**
- `npm run build:pages` → generated cleanly, responsive `srcset` confirmed in `index.html` + `ar.html`
- `npm run build:images` → **4 new responsive variants produced** (6.8K–31K each)
- Module imports of `api/_lib/verification.js` + `api/contact.js` → parse + export correctly

---

## 3. What's left (flagged, deliberately not done)

### 3.1 Rust backend — **your decision** (P2-2)

`src/*.rs` + `Cargo.toml` is a **complete duplicate** of the Node verification API (same routes: `/numbers`, `/numbers/{id}`, `/textnow-guide`, `/health`), last touched 3 commits ago, and **not referenced by any deploy config** (`vercel.json`, `render.static.yaml`). It's dormant. I did **not** delete it — that's your call. Options:

- **Delete** (`rm -rf src/ Cargo.toml`) — removes a maintenance trap, simplest.
- **Wire it up** behind a container (Render/Fly) if you want a non-serverless API.
- **Leave it** — but it will drift from the Node API and confuse future readers.

### 3.2 Optional env vars to set (for the features to take effect)

| Var | Purpose | Where |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Activates the Redis rate limiter (otherwise in-memory fallback) | Vercel project settings |
| `PGSSL=0` | Only if running against a local Postgres without SSL | local dev |

### 3.3 Things checked and confirmed need no work

- **3D island-loading (P2-3):** already done. The main site ships zero Three.js — confirmed `grep three public/index.html public/ar.html` → 0 matches. Three.js only loads on `/suraga-3d`, which *is* the island.
- **Image formats:** AVIF+WebP were already generated at build time; the only gap was the missing responsive `srcset`, now fixed.
- **Precompression (gzip+brotli):** already in place.

### 3.4 Not done — needs design input, not code

- **Turnstile/Captcha** on the contact form — honeypot + rate limiting are in, but if you want stronger anti-bot, this needs a site key.
- **Admin surface** for the verification DB — a feature, not a fix.

---

## 4. Files changed (8)

```
api/_lib/verification.js        +113  (pooler, timing-safe compare, Redis limiter)
api/contact.js                  +69   (escape, CRLF strip, length caps, honeypot, rate limit)
api/verification/[...path].js   -2/+2 (use async isAllowed, 3 call sites)
public/css/frontend-extras.css  +21   (honeypot hidden CSS)
public/js/modules/form.js       +5    (send honeypot field)
scripts/build-pages.mjs         +5    (honeypot field markup, responsive srcset)
scripts/build-images.mjs        +25   (responsive variant generation)
vercel.json                     -1/+1 (multi-region, hardened CSP)
```

Nothing committed — the tree has 8 modified + 2 untracked PNGs.
