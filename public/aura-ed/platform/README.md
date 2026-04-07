# Aura-Ed Platform (Build Slice 1)

This directory is the first runnable foundation of Aura-Ed as a platform, not just a concept page.

## What is included

- `apps/web-next`: bilingual-ready Next.js app with an adaptive recommendation form
- `services/api-gateway`: TypeScript/Express gateway with content + recommendation endpoints
- `services/adaptive-engine`: FastAPI service implementing adaptive scoring and support bands
- persistence layer in gateway:
  - PostgreSQL for intervention events
  - MongoDB for learning modules
  - Redis for content cache
- `packages/shared-types`: shared contracts for request/response and education entities
- `infra/docker-compose.yml`: container orchestration for local end-to-end startup

## Quick start (workspace)

1. Install dependencies from this folder:

```bash
npm install
```

2. Run adaptive engine (Python):

```bash
cd services/adaptive-engine
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8010
```

3. In another terminal, run gateway:

```bash
npm run dev:gateway
```

4. In another terminal, run web app:

```bash
npm run dev:web
```

5. Open:

- web: `http://localhost:3000`
- gateway health: `http://localhost:8000/health`
- adaptive health: `http://localhost:8010/health`
- gateway persistence health flags: `http://localhost:8000/health`

## Docker option

From `infra`:

```bash
docker compose up --build
```

This now starts:

- `postgres` on `5432`
- `mongo` on `27017`
- `redis` on `6379`
- `adaptive-engine` on `8010`
- `api-gateway` on `8000`
- `web-next` on `3000`

## Current API surface

- `GET /health`
- `GET /api/v1/content/modules`
- `GET /api/v1/interventions`
- `POST /api/v1/adaptive/recommendation`

Payload example:

```json
{
  "learnerId": "learner-001",
  "recentPerformance": 72,
  "engagementDuration": 68,
  "weightPerformance": 3,
  "weightEngagement": 2,
  "locale": "en"
}
```

## Current behavior notes

- modules are seeded to MongoDB on first gateway boot if collection is empty
- modules are cached in Redis with TTL (`REDIS_CACHE_TTL_SECONDS`)
- interventions are written to PostgreSQL and still mirrored in memory as runtime fallback

## Next implementation step

- add auth + tenant model for schools
- introduce migrations and stronger schema governance
- add localization routing and content management workflows
