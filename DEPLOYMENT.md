# Deployment (Render Docker + Optional Static Runtime)

This repository supports two deployment modes:

- Current: Render Web Service using Docker + `nginx` (`render.yaml`)
- Faster option: Render Static runtime (`render.static.yaml`)

## Production Stack

- Hosting: Render Web Service
- Runtime: native C web server (`nginx`)
- Build/deploy config: `render.yaml`, `Dockerfile`, `nginx/default.conf.template`
- Build pipeline: `npm run build` (`build-pages` + `build-images` + `build-assets`)

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

The Docker image:
1. Generates optimized output with `npm run build`.
2. Serves them through nginx with tuned cache, gzip compression, and security headers.

## Optional Migration: Render Static Runtime (Fastest Free-Tier)

Use `render.static.yaml` to create a new static service:

- `type: web`
- `runtime: static`
- `buildCommand: npm ci && npm run build`
- `staticPublishPath: public`
- Includes security/cache headers with same-origin framing support for PDF modal rendering

Note: Render runtime is immutable after service creation. If your current service is Docker-based, create a new static service and then point your domain to it.

## Runtime Config

`public/config.json` is generated during build and consumed by client JS:
```json
{
  "contactEndpoint": "https://formsubmit.co/ajax/suragaelzibaer@gmail.com"
}
```

To change the endpoint, update `site-src/content.mjs` (`siteConfig.contactEndpointDefault`) and rebuild.

## Troubleshooting

- If build fails: check Render build logs first.
- If UI changes are missing: verify `npm run build` output was committed.
- If form submission fails: verify `public/config.json` value and browser network logs.
