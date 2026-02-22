# Suraga Website

Render-served bilingual portfolio site (English + Arabic) built as a static Jamstack deployment:
- Static pages generated from a single source (`site-src/content.mjs`).
- CDN delivery via Render Static Site.
- UI/UX and behavior served from `public/`.

## Architecture

- `site-src/content.mjs`: canonical bilingual content and metadata.
- `scripts/build-pages.mjs`: generates:
  - `public/index.html`
  - `public/ar.html`
  - `public/robots.txt`
  - `public/sitemap.xml`
  - `public/config.json`
- `public/css/*`: styling.
- `public/js/main.js` + `public/js/modules/*`: modular front-end behavior.
- `render.yaml`: Render static service config (build command, publish path, headers).
- `tests/smoke/site.spec.js`: Playwright smoke coverage.

Note: legacy Rust service files remain in the repo, but production deployment uses static hosting.

## Local Development

1. Install dependencies:
```bash
npm install
```
2. Regenerate pages after content changes:
```bash
npm run build:pages
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

Use this workflow:
1. Edit `site-src/content.mjs`.
2. Run `npm run build:pages`.
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

Production target is Render Static Site via `render.yaml`.

Push to `main` to trigger redeploy.
