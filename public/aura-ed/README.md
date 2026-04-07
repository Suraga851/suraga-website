# Aura-Ed

Aura-Ed is a UAE-focused EdTech platform concept built around a simple premise:

The country has world-class digital ambition, but real online learning still breaks at the level of access, inclusion, teacher readiness, and assessment design.

This concept package turns that problem into a product foundation.

## Product Thesis

Aura-Ed is meant to close the gap between one-size-fits-all digital curriculum and the realities of inclusive classrooms. The core experience combines:

- Adaptive scaffolding based on learner performance and engagement
- SEND-aware accessibility and multimodal delivery
- Privacy-first engagement analytics
- Low-bandwidth and lower-spec device resilience
- Arabic-native UX and culturally relevant content pathways
- Teacher-visible AI recommendations instead of black-box automation

## Why This Exists

The supporting UAE brief highlighted a recurring pattern:

- national infrastructure is strong, but last-mile access is uneven
- device quality and affordability still create barriers
- many platforms are not designed well for learners with disabilities
- teachers need far more support to operationalize AI and blended pedagogy
- academic integrity cannot be solved through surveillance alone

Aura-Ed is designed in response to those exact gaps.

## Proposed Platform Shape

```text
apps/
  web-next/
  mobile-flutter/
services/
  api-gateway/
  auth-service/
  content-service/
  adaptive-engine/
  gradebook-service/
  realtime-service/
packages/
  design-system/
  shared-types/
  i18n/
infra/
  docker/
  kubernetes/
  terraform/
```

## Core Domains

### 1. Web and Mobile Experience

- `web-next`: school-facing web application for students, teachers, and families
- `mobile-flutter`: mobile shell for student access, notifications, and learning continuity
- Shared `design-system` and `i18n` packages to keep English and Arabic behavior aligned

### 2. Equity and Continuity Layer

- progressive loading for lesson media
- resumable learning state
- low-spec device mode
- selected offline-ready content blocks

This should be treated as a first-class product layer, not a future optimization.

### 3. Backend Services

- `api-gateway`: secure entry point for clients and third-party integrations
- `auth-service`: institution-aware authentication, roles, and tenant boundaries
- `content-service`: learning units, lesson assets, and bilingual metadata
- `gradebook-service`: submissions, outcomes, and intervention history
- `realtime-service`: classroom collaboration, signals, and mentorship events

### 4. Adaptive Intelligence

- `adaptive-engine`: internal service responsible for support-level recommendations
- TensorFlow.js or another browser-side path for local engagement scoring when edge analytics are enabled
- explainable intervention events so teachers can see why support was triggered

## Suggested Tech Stack

| Layer | Recommendation |
| --- | --- |
| Frontend web | Next.js, TypeScript, i18next, accessible component system |
| Mobile | Flutter |
| Backend | NestJS microservices |
| ML services | Python, FastAPI, TensorFlow.js, selective transformer services |
| Realtime | Socket.io or managed pub/sub |
| Data | PostgreSQL, MongoDB, Redis |
| Infra | Docker, Kubernetes, GitHub Actions |
| Hosting | Azure UAE Central or AWS Middle East |

## Adaptive Scaffolding Rule

Aura-Ed computes a support score from performance and engagement:

```text
Level_next = ((W1 * P_avg) + (W2 * D_norm)) / (W1 + W2)
```

Where:

- `P_avg` is recent learner performance
- `D_norm` is normalized engagement duration
- `W1` is the teacher-selected performance weight
- `W2` is the teacher-selected engagement weight

One possible MVP implementation:

```ts
type SupportBand = "intensive" | "guided" | "stretch";

export function computeSupportBand(
  performance: number,
  engagement: number,
  weightPerformance: number,
  weightEngagement: number
): { score: number; band: SupportBand } {
  const score =
    ((weightPerformance * performance) + (weightEngagement * engagement)) /
    (weightPerformance + weightEngagement);

  if (score < 50) return { score, band: "intensive" };
  if (score < 75) return { score, band: "guided" };
  return { score, band: "stretch" };
}
```

This stays intentionally simple in the MVP so educators can trust the behavior and challenge it when needed.

## Data Model Starter

PostgreSQL should own the academic truth:

- `institutions`
- `users`
- `students`
- `teachers`
- `courses`
- `enrollments`
- `learning_units`
- `submissions`
- `interventions`
- `mentorship_matches`

MongoDB should store flexible learning assets:

- lesson documents
- multilingual media metadata
- content variants
- accessibility overlays

Redis should handle:

- presence heartbeat snapshots
- live room state
- chat or poll events
- short-lived intervention queues

## Compliance Baseline

- Encrypt PII in transit and at rest
- Minimize collection of raw biometric data
- Keep raw engagement media local when edge inference is enabled
- Maintain tenant boundaries per institution
- Keep audit trails for intervention recommendations
- Bake keyboard and screen-reader access into every major workflow
- Prefer authentic assessment workflows over surveillance-heavy defaults

## MVP Order

1. Ship the bilingual web shell and identity model
2. Add the content and gradebook services
3. Introduce the first explainable adaptive support loop
4. Add low-bandwidth continuity and accessibility controls
5. Layer in teacher enablement and moderated peer mentorship

## What Is Already Built Here

This folder currently includes:

- `index.html`: a bilingual concept page for Aura-Ed
- `styles.css`: the visual system for the concept page
- `app.js`: the language switcher and adaptive scaffolding simulator

## Recommended Next Step

Turn this concept slice into a real monorepo by creating:

1. `apps/web-next` for the production web interface
2. `services/api-gateway` and `services/adaptive-engine` first
3. a shared schema package for user, course, and intervention types
