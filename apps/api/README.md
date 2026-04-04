# @udyogasakha/api

NestJS REST API — the shared backend for the UdyogaSakha platform.

## Quick start

```bash
# From monorepo root — start infrastructure
docker compose up -d

# Install deps
npm install

# Generate Prisma client
cd apps/api && npx prisma generate

# Run migrations + seed
npm run db:migrate && npm run db:seed

# Start in watch mode
npx turbo run dev --filter=@udyogasakha/api
```

API runs at `http://localhost:3001`  
Swagger docs at `http://localhost:3001/api/docs`  
Health check at `http://localhost:3001/api/v1/health`

## Module map

| Module | Path | Purpose |
|--------|------|---------|
| Auth | `/auth` | JWT, registration, login, token rotation |
| Users | `/users` | Profiles, DPDP deletion, admin role management |
| Trust | `/trust` | L0–L4 trust framework, badges, screening |
| Opportunities | `/opportunities` | 9-module opportunity lifecycle |
| Engagements | `/engagements` | Applications, matching, feedback |
| Moderation | `/moderation` | Reports queue, enforcement actions |
| Governance | `/governance` | EGC/DEP councils, sessions, conflict declarations |
| Notifications | `/notifications` | In-app REST + WebSocket real-time |
| Analytics | `/analytics` | Platform statistics — admin only |
| Search | `/search` | Meilisearch + Postgres fallback |
| Audit | `/audit` | Immutable append-only event log |
| Health | `/health` | Liveness and readiness probes |

## Scheduled jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| opportunity-expiry | Every hour | Auto-closes published opps past `closesAt` |
| badge-expiry | Daily 01:00 | Marks expired trust badges |
| reputation-recalc | Daily 02:00 | Recalculates reputation scores from feedback |
| stale-verification-alert | Weekly Sun 03:00 | Alerts on unreviewed verification requests > 14 days |
| moderation-backlog-alert | Every 4h | Warns if 10+ opps waiting in moderation > 48h |

## Running tests

```bash
# Unit tests
npx jest

# Unit tests with coverage
npx jest --coverage

# E2E tests (requires Postgres + Redis running)
npx jest --config test/jest-e2e.config.ts
```

## Database

```bash
# Run migrations
npx prisma migrate dev --name describe_change

# Generate Prisma client after schema changes
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Generate ERD diagram (requires prisma-erd-generator)
npx prisma generate  # writes docs/ERD.svg
```
