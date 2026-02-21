# Suraga Website

Render-served bilingual portfolio site (English + Arabic) built as:
- Rust (`actix-web`) server for static hosting + headers + runtime config.
- Generated static pages in `public/`.
- Single content source in `site-src/content.mjs`.

## Architecture

- `src/main.rs`: web server, security headers, `/health`, `/config.json`, static file serving.
- `site-src/content.mjs`: canonical bilingual content and metadata.
- `scripts/build-pages.mjs`: generates:
  - `public/index.html`
  - `public/ar.html`
  - `public/robots.txt`
  - `public/sitemap.xml`
- `public/css/*`: styling.
- `public/js/main.js` + `public/js/modules/*`: modular front-end behavior.
- `tests/smoke/site.spec.js`: Playwright smoke coverage.

## Local Development

1. Install dependencies:
```bash
npm install
```
2. Regenerate pages after content changes:
```bash
npm run build:pages
```
3. Run the Rust server:
```bash
cargo run
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

Rust checks:
```bash
cargo fmt --all --check
cargo clippy --all-targets -- -D warnings
cargo test --all-targets
```

## Content Workflow

Do not hand-edit generated pages (`public/index.html`, `public/ar.html`, `public/robots.txt`, `public/sitemap.xml`) unless debugging.

Use this workflow:
1. Edit `site-src/content.mjs`.
2. Run `npm run build:pages`.
3. Commit both source and regenerated output.

## Runtime Config

Environment variables:
- `PORT` (default: `8080`)
- `CONTACT_FORM_ENDPOINT` (default: `https://formsubmit.co/ajax/suragaelzibaer@gmail.com`)
- `RUST_LOG` (default: `actix_web=info`)

`/config.json` exposes runtime client config (currently contact endpoint).

## Deployment

The production target is Render via Docker (`render.yaml`, `Dockerfile`).

Push to `main` to trigger redeploy.
