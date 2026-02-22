# Deployment (Render Static Site)

This repository is configured for Render Static Site deployment.

## Production Stack

- Hosting: Render Static Site (CDN)
- Runtime: static build output from `public/`
- Build/deploy config: `render.yaml`

## Pre-Deploy Checklist

1. Regenerate pages from source content:
```bash
npm run build:pages
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

`render.yaml`:
- `type: web`
- `runtime: static`
- `plan: free`
- `buildCommand: npm ci && npm run build:pages`
- `staticPublishPath: ./public`
- custom response headers and cache policies

## Runtime Config

`public/config.json` is generated during build and consumed by client JS:
```json
{
  "contactEndpoint": "https://formsubmit.co/ajax/suragaelzibaer@gmail.com"
}
```

To change the endpoint, update `site-src/content.mjs` (`siteConfig.contactEndpointDefault`) and rebuild.

## Migrating Existing Docker Service

If your current Render service is a Docker web service, Render does not allow changing runtime type in-place.

Use this one-time migration:
1. Create a new Render Static Site from this repo/blueprint (`render.yaml`).
2. Verify `index.html` and `ar.html` render correctly.
3. Move custom domain (if any) to the static service.
4. Delete the old Docker service.

## Troubleshooting

- If build fails: check Render build logs first.
- If UI changes are missing: verify `npm run build:pages` output was committed.
- If form submission fails: verify `public/config.json` value and browser network logs.
