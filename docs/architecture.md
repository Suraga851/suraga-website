# Architecture Overview

## Goal

Keep one production stack and one source of truth for content while preserving a fast static UX.

## Current Design

- **Server**: Rust (`actix-web`) in `src/main.rs`.
- **Static output**: `public/` served directly by Rust.
- **Content source**: `site-src/content.mjs`.
- **Generation step**: `scripts/build-pages.mjs` outputs HTML + SEO files.
- **Frontend runtime**: modular JavaScript under `public/js/modules`.

## Request Flow

1. Browser requests page.
2. Rust server serves static files from `public/`.
3. Browser loads `public/js/main.js` (ES modules).
4. Client fetches `/config.json` for runtime settings (contact endpoint).
5. Form submissions go to configured endpoint.

## Operational Endpoints

- `GET /health`: health probe.
- `GET /config.json`: runtime client config.

## Maintainability Rules

1. Edit content in `site-src/content.mjs` only.
2. Regenerate pages with `npm run build:pages`.
3. Commit both source and generated output.
4. Keep Rust server concerns limited to hosting, headers, and runtime config.
5. Keep front-end behavior modular and section-focused.
