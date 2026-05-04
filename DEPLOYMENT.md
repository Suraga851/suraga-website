# Deployment (Vercel Frontend + Render Backend Redirect)

This repository supports two deployment modes:

- Current frontend: Vercel static deployment (`vercel.json`)
- Current backend: existing Render Docker web service (`render.yaml`)
- Optional legacy static-only Render setup: `render.static.yaml`

## Production Stack

- Frontend hosting: Vercel
- Backend hosting: existing Render Web Service
- Render runtime: Rust API + redirect service
- Build/deploy config: `render.yaml`, `Dockerfile`, `vercel.json`

## Pre-Deploy Checklist

1. Regenerate pages from source content:
```bash
npm run build
```
2. Run checks:
```bash
npm run check
```
3. Run smoke tests:
```bash
npm run test:smoke
```
4. Commit and push to `main`.

## Render Service Settings

`render.yaml` (current service):
- `type: web`
- `runtime: docker`
- `plan: free`
- `region: frankfurt`
- `healthCheckPath: /health`

The Docker image now:
1. Builds the Rust service from `src/main.rs`.
2. Serves `/api/verification/*` and `/health`.
3. Redirects all normal page requests from `suraga-website.onrender.com` to `https://suraga-website.vercel.app`.

## Vercel Frontend Routing

`vercel.json` rewrites:
- `/api/verification/*` -> `https://suraga-website.onrender.com/api/verification/*`

That keeps the Vercel frontend same-origin from the browser while using the Render service as the API backend.

## Optional Legacy Static Runtime

Use `render.static.yaml` to create a new static service:

- `type: web`
- `runtime: static`
- `buildCommand: npm ci && npm run build`
- `staticPublishPath: public`
- Includes security/cache headers with same-origin framing support for PDF modal rendering

Note: Render runtime is immutable after service creation. If your current service is Docker-based, create a new static service and then point your domain to it.

Free-tier caveat as of April 8, 2026:
- Render Free web services spin down after inactivity and can take about a minute to wake up.
- Render Free web services use an ephemeral filesystem, so the default SQLite file at `./verification.db` will reset on restart, redeploy, or spin-down.

For durable storage:
- Upgrade the Render service and attach a persistent disk, then change `DATABASE_URL` to a mounted path such as `/opt/render/project/src/data/verification.db`.
- Or move the verification data to a managed database instead of local SQLite.

## Runtime Config

`public/config.json` is generated during build and consumed by client JS:
```json
{
  "contactEndpoint": "https://formsubmit.co/ajax/suragaelzibaer@gmail.com"
}
```

To change the endpoint, update `site-src/content.mjs` (`siteConfig.contactEndpointDefault`) and rebuild.

Build-time SEO environment variables:
- `SITE_URL`: canonical public origin for generated metadata, sitemap entries, and structured data.
- `GOOGLE_SITE_VERIFICATION`: optional Search Console verification token injected into generated HTML.

## Troubleshooting

- If build fails: check Render build logs first.
- If UI changes are missing: verify `npm run build` output was committed.
- If form submission fails: verify `public/config.json` value and browser network logs.
