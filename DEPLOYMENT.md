# Deployment (Render)

This repository deploys to Render using Docker.

## Production Stack

- Hosting: Render Web Service
- Runtime: Rust binary (`actix-web`)
- Static assets: `public/`
- Build/deploy config: `render.yaml`, `Dockerfile`

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
- `region: ohio`

## Environment Variables

Configure in Render dashboard:
- `PORT`: Render sets this automatically.
- `CONTACT_FORM_ENDPOINT`: Optional override for contact form backend.
- `RUST_LOG`: Optional (example: `info`).

## Health Endpoint

- `GET /health` returns `200 ok`.
- Use it for uptime monitoring.

## Runtime Client Config

- `GET /config.json` returns:
```json
{
  "contactEndpoint": "..."
}
```

Client-side JS reads this to determine where the contact form submits.

## Troubleshooting

- If build fails: check Render build logs first.
- If UI changes are missing: verify `npm run build:pages` output was committed.
- If form submission fails: verify `CONTACT_FORM_ENDPOINT` and browser network logs.
