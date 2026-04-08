# Suraga Website

Vercel-hosted bilingual portfolio site (English + Arabic) with the legacy Render service reused as the verification API backend and redirect target.
- Static pages generated from a single source (`site-src/content.mjs`).
- Fingerprinted/minified JS + CSS bundles generated at build time.
- Self-hosted fonts/icons (no runtime Google Fonts or CDN icon calls).
- Modern image variants (`.webp`/`.avif`) generated for hero/background.
- UI/UX and behavior served from `public/`.

## Architecture

- `site-src/content.mjs`: canonical bilingual content and metadata.
- `scripts/build-pages.mjs`: generates:
  - `public/index.html`
  - `public/ar.html`
  - `public/robots.txt`
  - `public/sitemap.xml`
  - `public/config.json`
- `scripts/build-images.mjs`: generates optimized image variants and favicon assets.
- `scripts/build-assets.mjs`: bundles/minifies/fingerprints CSS/JS into `public/assets/build`.
- `scripts/entries/styles-en.css`, `scripts/entries/styles-ar.css`: bundle entrypoints.
- `public/css/*`: styling.
- `public/js/main.js` + `public/js/modules/*`: modular front-end behavior.
- `Dockerfile`: builds the Render backend service.
- `render.yaml`: current Render Docker web service config.
- `render.static.yaml`: optional Render Static Site blueprint for edge-cached deployment.
- `tests/smoke/site.spec.js`: Playwright smoke coverage.

## Local Development

1. Install dependencies:
```bash
npm install
```
2. Regenerate pages after content changes:
```bash
npm run build
```
3. Serve static output:
```bash
npx http-server public -p 8080 -c-1 --silent
```
4. Open:
```text
http://127.0.0.1:8080
```

## Quality Gates

Run static checks:
```bash
npm run check
```

Run smoke tests:
```bash
npm run test:smoke
```

## Content Workflow

Do not hand-edit generated pages (`public/index.html`, `public/ar.html`, `public/robots.txt`, `public/sitemap.xml`, `public/config.json`) unless debugging.
Do not hand-edit generated bundles in `public/assets/build/`.

Use this workflow:
1. Edit `site-src/content.mjs`.
2. Run `npm run build`.
3. Commit both source and regenerated output.

## Runtime Config

`public/config.json` is generated at build time and currently exposes:
```json
{
  "contactEndpoint": "https://formsubmit.co/ajax/suragaelzibaer@gmail.com"
}
```

The page also carries a `data-contact-endpoint` fallback on `<body>`.

## Deployment

Production target today is:
- Vercel for the public frontend
- the existing Render service for `/api/verification/*` and `/health`

The old Render domain is intentionally retained as the backend host and should redirect normal page visits to the Vercel site after deploy.

Push to `main` to trigger redeploy.
