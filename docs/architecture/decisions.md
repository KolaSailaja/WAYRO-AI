# Architecture Decision Records — WAYRO AI

This directory contains Architecture Decision Records (ADRs) documenting the key decisions made during the design and development of WAYRO AI.

---

## ADR-001: Technology Stack

**Date:** 2026-10-14  
**Status:** Accepted

### Decision

Adopt Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 as the primary web stack, with Prisma ORM for database access, Auth.js for authentication, and Zod for validation.

### Context

The project is built by a student team who need a maintainable, production-capable stack with strong community support, good documentation, and minimal operational overhead at this stage.

### Reasoning

| Concern | Decision | Reason |
|---|---|---|
| Full-stack in one repo | Next.js App Router | Eliminates the need for a separate API server at this stage |
| TypeScript | Yes | Catches type errors early, essential for a growing team |
| Styling | Tailwind CSS v4 | Utility-first, consistent, integrates cleanly with Next.js |
| ORM | Prisma ORM v6 | Type-safe queries, schema-first migrations, excellent DX |
| Auth | Auth.js (NextAuth v5 beta) | Free, supports OAuth providers, Prisma adapter available |
| Validation | Zod | TypeScript-native, shared between client and server |
| Testing | Vitest + RTL | Fast, compatible with modern React, jsdom environment |

### Consequences

- All deployment targets must support Node.js ≥ 18.
- A PostgreSQL instance is required (local or hosted via Prisma Postgres or Supabase).
- AI provider selection is deferred behind a service interface.

---

## ADR-002: Monorepo vs Separate Repos

**Date:** 2026-10-14  
**Status:** Accepted

### Decision

Use a single Next.js application repository rather than a monorepo or multiple separate repos.

### Reasoning

A monorepo (Turborepo/Nx) and separate repos both add operational complexity that is not justified at this stage. The single Next.js app keeps onboarding simple and allows the team to ship quickly. If the AI services or backend need to be independently deployed later, they can be extracted at that point.

---

## ADR-003: AI Provider Interface

**Date:** 2026-10-14  
**Status:** Accepted

### Decision

All AI interactions go through a provider-agnostic `AIService` interface defined in `src/lib/ai/types.ts`. Concrete implementations are selected via the `AI_PROVIDER` environment variable.

### Reasoning

- Prevents vendor lock-in at the product layer.
- Enables development and testing without an API key (via the mock provider).
- Makes it straightforward to A/B test providers or swap to a cheaper option.

### Current state

Only the mock provider is implemented. Real providers (OpenAI, Anthropic, Google) can be added by creating a class that implements `AIService` and registering it in `src/lib/ai/index.ts`.

---

## ADR-004: Data Boundaries

**Date:** 2026-10-14  
**Status:** Accepted

### Decision

The codebase enforces clear module boundaries:

```
UI components  →  server/route handlers  →  lib/  →  db/
                                         →  lib/  →  ai/
```

- UI components contain no direct database calls.
- Route handlers contain no direct SQL.
- AI provider SDKs are imported only inside `src/lib/ai/`.
- Secrets are read only from `src/lib/env.ts`.

### Consequence

Adding a new feature requires touching each boundary independently, making it easier to test, replace, and audit each layer.

---

## ADR-005: Demonstration Data Policy

**Date:** 2026-10-14  
**Status:** Accepted

### Decision

All demonstration data is:

1. Stored in `src/lib/fixtures.ts` with a top-level comment clearly identifying it as synthetic.
2. Labelled in the UI with a visible `DemoNotice` component.
3. Never described as verified, live, or AI-generated real research.

### Consequence

Students using the platform during development are never misled about the authenticity of opportunity listings or readiness scores.

---

## Module Responsibilities

| Module | Path | Responsibility |
|---|---|---|
| App pages | `src/app/(app)/` | Page-level components, metadata, routing |
| UI components | `src/components/ui/` | Reusable, stateless UI primitives |
| Layout components | `src/components/layout/` | Application shell, sidebar, header |
| AI service | `src/lib/ai/` | Provider-agnostic AI interface and implementations |
| DB client | `src/lib/db/` | Prisma singleton, query helpers |
| Auth | `src/lib/auth/` | Auth.js configuration (to be implemented) |
| Environment | `src/lib/env.ts` | Validated, typed environment variables |
| Types | `src/types/` | Shared domain types (decoupled from DB and API) |
| Fixtures | `src/lib/fixtures.ts` | Demonstration data only |
| API routes | `src/app/api/` | Route handlers (server-side API endpoints) |
| Prisma schema | `prisma/schema.prisma` | Database schema and migration source of truth |
| Tests | `tests/` + `src/**/*.test.ts` | Unit and integration tests |
| Docs | `docs/` | Architecture decisions, product specs, dev guides |

---

## Data Flow

```
Browser → Next.js Route Handler → lib/db (Prisma) → PostgreSQL
Browser → Next.js Route Handler → lib/ai (AIService) → AI Provider
```

Server components fetch data directly from lib/. Client components call route handlers via `fetch`.
