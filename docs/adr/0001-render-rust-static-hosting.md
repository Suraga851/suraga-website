# ADR 0001: Render + Rust Static Hosting

## Status
Accepted

## Context

The repository previously mixed multiple deployment targets and front-end implementations, which caused drift and deployment confusion.

## Decision

Use a single production stack:
- Render for hosting
- Docker build
- Rust (`actix-web`) as static server + runtime config provider

## Consequences

Positive:
- One deploy path.
- Clear runtime ownership.
- Easier incident debugging.

Trade-offs:
- Requires Rust toolchain for local backend development.
- Static generation still needed for content updates.
