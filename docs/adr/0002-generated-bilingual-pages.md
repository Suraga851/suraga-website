# ADR 0002: Generated Bilingual Pages from Shared Content

## Status
Accepted

## Context

Maintaining separate hand-written `public/index.html` and `public/ar.html` caused duplication and inconsistent updates.

## Decision

Adopt one content source (`site-src/content.mjs`) and generate both pages via `scripts/build-pages.mjs`.

Generated artifacts:
- `public/index.html`
- `public/ar.html`
- `public/robots.txt`
- `public/sitemap.xml`

## Consequences

Positive:
- Stronger DRY principle.
- Reduced bilingual drift.
- Easier SEO consistency.

Trade-offs:
- Requires generation step before commit.
- Direct edits in generated files can be overwritten.
