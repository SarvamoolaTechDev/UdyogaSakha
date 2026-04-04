# UdyogaSakha

> A Foundation-governed Udyoga facilitation ecosystem connecting opportunity seekers and providers under a transparent trust framework.

---

## What This Is

UdyogaSakha is a structured digital platform enabling dignified and accountable participation across nine categories of work:

- Employment Exchange
- Agency & Staff Augmentation
- Project & Tender Exchange
- Consultancy & Advisory
- Service Engagement Roles (including traditional and cultural roles)
- Vendor & Marketplace Exchange
- Training & Skill Development
- Startup & Innovation Exchange
- Volunteer & Social Impact Engagements

All participation is governed by a tiered Trust Framework (L0–L4) and a structured moderation and audit layer operated by the Foundation.

---

## Repository Structure

```
udyogasakha/
├── apps/
│   ├── api/        NestJS backend — shared API server (port 3001)
│   ├── web/        Next.js member portal (port 3000)
│   └── admin/      Next.js governance & moderation portal (port 3002)
├── packages/
│   ├── types/      Shared TypeScript types and enums
│   ├── validators/ Shared Zod validation schemas
│   └── api-client/ Typed Axios client used by web and admin
├── docker-compose.yml   Local dev infrastructure
├── turbo.json           Turborepo pipeline config
└── .env.example         All required environment variables
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| npm | 10+ |
| Docker + Docker Compose | For local DB/Redis/Meilisearch |
| Git | Any recent version |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-org/udyogasakha.git
cd udyogasakha
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set at minimum:

```env
DATABASE_URL=postgresql://udyoga:udyoga_dev@localhost:5432/udyogasakha_dev
JWT_SECRET=your-long-random-secret-here
JWT_REFRESH_SECRET=another-long-random-secret-here
```

### 3. Start infrastructure

```bash
# Starts PostgreSQL, Redis, and Meilisearch in Docker
docker compose up -d
```

Verify everything is healthy:

```bash
docker compose ps
```

### 4. Run database migrations and seed

```bash
npm run db:migrate   # Runs Prisma migrations
npm run db:seed      # Creates admin user + dev test participant
```

Seed credentials (development only):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@udyogasakha.org | ChangeMe@123 |
| Participant | participant@example.com | Test@1234 |

### 5. Start the API

```bash
# Start just the API in watch mode
npx turbo run dev --filter=@udyogasakha/api

# Or start everything (API + web + admin)
npm run dev
```

| Service | URL |
|---------|-----|
| API | http://localhost:3001 |
| Swagger docs | http://localhost:3001/api/docs |
| Health check | http://localhost:3001/api/v1/health |
| Web portal | http://localhost:3000 |
| Admin portal | http://localhost:3002 |
| Meilisearch | http://localhost:7700 |

---

## Development Workflow

### Running tests

```bash
# All unit tests
cd apps/api && npx jest

# With coverage
cd apps/api && npx jest --coverage

# Watch mode
cd apps/api && npx jest --watch
```

### Linting and formatting

```bash
npm run lint          # ESLint across all packages
npx prettier --write "**/*.{ts,json}"   # Format all files
```

### Adding a Prisma migration

```bash
cd apps/api
npx prisma migrate dev --name describe_your_change
```

### Generating Prisma client after schema change

```bash
cd apps/api && npx prisma generate
```

### Viewing the database

```bash
cd apps/api && npx prisma studio
# Opens at http://localhost:5555
```

---

## API Overview

All endpoints are prefixed `/api/v1`. Full Swagger docs available at `/api/docs` in development.

| Group | Base path | Auth required |
|-------|-----------|---------------|
| Auth | `/auth` | Partial |
| Users | `/users` | Yes |
| Trust | `/trust` | Yes |
| Opportunities | `/opportunities` | Yes |
| Engagements | `/engagements` | Yes |
| Moderation | `/moderation` | Yes (Moderator+) |
| Governance | `/governance` | Yes (Admin+) |
| Audit | `/audit` | Yes (Admin+) |
| Health | `/health` | No |

---

## Trust Levels

| Level | Name | How obtained |
|-------|------|-------------|
| L0 | Registered | Account created |
| L1 | Document Verified | KYC documents reviewed by Moderation Cell |
| L2 | Foundation Screened | Structured interview by Foundation panel |
| L3 | Domain Expert Certified | Assessment by Domain Expert Panel (DEP) |
| L4 | Community Endorsed | Earned through completion history and ratings |

---

## Environment Variables

All variables are documented in `.env.example`. Key ones:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret |
| `REDIS_URL` | No | Defaults to `redis://localhost:6379` |
| `MEILISEARCH_HOST` | No | Defaults to `http://localhost:7700` |
| `STORAGE_ENDPOINT` | Phase 1 | S3-compatible storage (deferred) |

---

## Phase Rollout

| Phase | Focus | Key Modules |
|-------|-------|-------------|
| 1 — MVP | Core platform + governance | Auth, Trust L0–L2, Employment Exchange, Service Roles |
| 2 — Expansion | Professional modules + fees | Project/Tender, Consultancy, Training, Payments |
| 3 — Marketplace | Enterprise + innovation | Vendor, Startup, Trust L4, Subscriptions |
| 4 — Governance+ | Maturity + compliance | Advanced audit, escrow, DPDP, multilingual |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API framework | NestJS (TypeScript) |
| Database | PostgreSQL + Prisma ORM |
| Cache / Queues | Redis + BullMQ |
| Search | Meilisearch |
| Auth | JWT (Passport.js) |
| Validation | Zod |
| Web | Next.js 14 + Tailwind CSS |
| Admin | Next.js 14 + Tailwind CSS |
| Monorepo | Turborepo |
| CI | GitHub Actions |

---

## Contributing

Please coordinate with the project lead before raising PRs.

Branch strategy:
- `main` — production-ready code only
- `develop` — integration branch, CI must pass
- `feature/*` — individual feature branches off `develop`

All PRs require passing CI (lint + typecheck + unit tests).

---

## Licence

Proprietary — Foundation-governed project. All rights reserved.
