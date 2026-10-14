# WAYRO AI

> **Find Your Way. Make It Happen.**
> From Opportunity to Achievement.

WAYRO AI is a student opportunity-to-achievement workspace. The current implementation offers a clearly labelled demonstration catalogue, explainable profile-to-listing heuristics, readiness tasks, a learning resource tracker, hackathon proposal drafting, application tracking, and a draggable CSS 3D student journey.

## Problem and intended impact

Students often have to search fragmented opportunity listings without knowing how well they match, what eligibility details are still unknown, or what preparation to do next. WAYRO connects a profile, opportunity comparison, explicit skill gaps, linked learning, and application tracking in one workflow. Its differentiation is the explainable transition from discovery to preparation rather than an opaque match score. The intended impact is a clearer, actionable path for students; this local demo does not yet measure real-world outcomes.

## Implemented today

- **Dashboard:** recommendations, profile completion, tracked deadlines, learning/application metrics, and recent next steps, all derived from the local state.
- **Opportunities:** searchable/filterable examples, profile-match sorting, saved listings, detail pages, application-status tracking, and heuristic trust warnings.
- **Matching/readiness:** deterministic skill and profile comparisons, explicit unknown states, and persistent gap/verification tasks. A score is not a validated prediction or eligibility decision.
- **Learning:** sample links to public resources and persisted task progress. WAYRO does not issue third-party credentials.
- **Hackathon Lab:** creates three deterministic proposal drafts, lets a student choose and rename one, and retains feasibility, MVP, risks, evaluation, and evidence-status notes. These are brainstorming hypotheses; no web research or AI provider is connected.
- **Profile/progress/settings:** persisted profile, education, skills, interests, projects, goals, preferences, application and learning history, in-app reminders, and JSON export.
- **Journey:** draggable CSS 3D stage map with direct links and a keyboard-accessible card alternative.

All opportunity listings and learning entries are labelled examples. No live opportunity feed, research service, or outbound notification service is configured.

## Architecture and persistence

- Next.js App Router route handlers expose `/api/state`, `/api/health`, and `/api/hackathon/generate`.
- Shared domain logic is in `src/lib`: scoring, readiness, filters, trust heuristics, resource catalogues, proposal generation, validation, and persistence.
- `AppStateProvider` connects pages to the validated state API.
- `prisma/schema.prisma` defines the PostgreSQL data model; the genuine generated Prisma Client is available via `@prisma/client`. **The routes do not yet use PostgreSQL.**
- Students can create accounts with an email address and a password of at least 12 characters; no invitation/access passphrase is required. Passwords are stored as salted scrypt hashes, and registration signs the student in using a 12-hour HMAC-signed, HTTP-only, same-site cookie. `AUTH_SECRET` (at least 32 characters) is required.
- Student accounts and their application state are stored separately as local JSON under `.data/` (or `WAYRO_DATA_DIR` when configured). Account data is isolated by student, and filesystem read/write errors are reported rather than treated as successful saves. The app does not currently send verification email, password-reset email, or other email.
- `prisma/schema.prisma` defines the existing PostgreSQL data model, but account and application routes are not connected to PostgreSQL. Local JSON storage is not suitable for multiple app instances, durable public hosting, or a production account service.
- The AI provider interface currently supports only an explicitly labelled mock implementation. Set `AI_PROVIDER=mock`; selecting an unimplemented provider returns a configuration error rather than silently substituting mock output.

## Requirements

- Node.js 22 (the installed Next.js/Vite toolchain requires a modern Node runtime)
- npm 10+
- PostgreSQL is optional for the demo; no database is required to run the UI or tests.

## Local development

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. The development server loads `.env.local`; Prisma CLI commands conventionally read `.env`. Configure `DATABASE_URL` only when validating/generating Prisma or applying migrations. The current application routes continue to use local JSON storage even if `DATABASE_URL` is set.

## Environment variables

See [.env.example](./.env.example). The local UI needs no provider credentials.

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | No | Defaults to `http://localhost:3000`. |
| `DATABASE_URL` | No | PostgreSQL connection for Prisma commands; not currently wired to app persistence. |
| `AI_PROVIDER` | No | `mock` is the only implemented choice. |
| `AUTH_SECRET` | Yes for signup/sign-in | Random session-signing secret of at least 32 characters. Keep it private and configure it as a deployment secret. |
| `WAYRO_DATA_DIR` | No | Local directory for account and per-student JSON data; defaults to `.data`. |

## Database and Prisma

```powershell
$env:DATABASE_URL = "postgresql://user:password@localhost:5432/wayro_dev?schema=public"
npm run db:validate
npm run db:generate
npm run db:deploy
```

The initial PostgreSQL migration is committed under `prisma/migrations`. `db:deploy` applies it to the configured database. Application routes still use local JSON storage until a repository adapter is implemented; merely setting `DATABASE_URL` does not switch storage.

## Container and Cloud Run preparation

The multi-stage Dockerfile builds Next.js in standalone mode, listens on port `8080`, runs as an unprivileged user, and exposes `/api/health` as its container health check.

```powershell
docker build -t wayro-ai:local .
docker run --rm -p 8080:8080 -v wayro-data:/app/.data wayro-ai:local
```

The named volume is useful for local container smoke tests only; Cloud Run's writable filesystem is ephemeral and is not durable database storage. Student sessions and local data are account-isolated, but the JSON account store is not suitable for multiple instances or public production use. **Do not expose the current service publicly:** before public deployment, connect accounts and application data to durable PostgreSQL storage, add email verification and password-reset flows, and review abuse protections. Configure a Cloud Run service only after those prerequisites and a reviewed project/region/service identity are in place. No Cloud Run resource has been created from this repository.

## Quality checks

```powershell
npm run type-check
npm run lint
npm test
npm run build
```

External provider credentials are not required for the standard checks.

## Important limitations

- The included opportunity records and dates are synthetic demonstrations, not real openings.
- Student state is isolated in a single-machine JSON store, but does not provide concurrency across server instances, durable storage, email verification, password recovery, or a production backup strategy. Do not treat this demo account system as ready for public production deployment.
- No real AI completion, web research, opportunity ingestion, email, or push notification provider is connected.
- Research-like proposal text is deterministic brainstorming; no citations are retrieved and no gap is represented as verified.
- Trust checks are cautious text/link heuristics only. WAYRO does not check URL reachability or make fraud verdicts.
