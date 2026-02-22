# Deployment (Render Docker + nginx)

This repository is configured for Render Web Service deployment using Docker.

## Production Stack

- Hosting: Render Web Service
- Runtime: native C web server (`nginx`)
- Build/deploy config: `render.yaml`, `Dockerfile`, `nginx/default.conf.template`

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
- `env: docker`
- `plan: free`
- `region: frankfurt`
- `healthCheckPath: /health`

The Docker image:
1. Generates pages with `npm run build:pages`.
2. Serves them through nginx with tuned cache, gzip compression, and security headers.

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
- If UI changes are missing: verify `npm run build:pages` output was committed.
- If form submission fails: verify `public/config.json` value and browser network logs.
