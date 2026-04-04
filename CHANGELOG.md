# Changelog

All notable changes to UdyogaSakha are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Added
- `@udyogasakha/ui` shared component package — `TrustBadge`, `ModuleChip`, `Skeleton`,
  `EmptyState`, `StatusBadge`, shared `utils.ts` (formatDate, truncate, cn, statusVariant, moduleTypeLabel, trustLevelLabel)
- `SchedulerModule` with 5 cron jobs: opportunity expiry (hourly), badge expiry (daily 01:00),
  reputation recalculation (daily 02:00), stale verification alert (weekly), moderation backlog alert (every 4h)
- `AppLogger` structured JSON logging — production emits JSON, development pretty-prints
- `RequestIdMiddleware` — `X-Request-ID` correlation header on every request/response
- `SanitizeMiddleware` — strips HTML tags from all request body strings (XSS prevention)
- `DELETE /users/me` — DPDP right-to-erasure endpoint with active-engagement guard
- `PATCH /users/:id/roles` — admin role management endpoint
- `GET /engagements/:id` — individual engagement detail endpoint
- `GET /governance/sessions` — screening sessions list endpoint
- `GET /governance/members/:memberId/conflicts` — conflict declarations per member
- `GET /notifications` + `GET /notifications/unread-count` + `PATCH /notifications/:id/read` + `PATCH /notifications/read-all` — full notifications REST API
- `Notification` Prisma model — in-app notifications now persisted to DB
- `NotificationsService` — persists in-app notifications and pushes real-time via WebSocket
- `AnalyticsModule` — platform stats endpoints: overview, trust distribution, opportunities by module, weekly activity, governance health
- `QueueModule` — BullMQ job queue with notification, search-sync, and verification workers
- `SearchModule` — Meilisearch with transparent Postgres fallback
- WebSocket notifications gateway — real-time push with JWT auth, personal room per user
- Redis-backed refresh token rotation in `AuthService` with replay attack detection
- `TransformInterceptor` — wraps all success responses in `{ data, statusCode, timestamp }`
- `LoggingInterceptor` — structured HTTP request/response logging
- `AllExceptionsFilter` — uniform `{ statusCode, message, errors, path, timestamp }` error shape
- `ThrottlerModule` — 60 req/min per IP rate limiting
- Web: Settings page (privacy + DPDP account deletion), public `/browse` SSR page,
  rebuilt landing page, `not-found.tsx`, `error.tsx`, portal-level error boundary
- Web: `NotificationsBell` with WebSocket + REST polling, `ApplyModal`, `Toast`, `Skeleton`,
  `EmptyState`, `ErrorBoundary`, `OpportunityCard`, `TrustBadgeWidget`, `CreateOpportunityForm` (3-step wizard)
- Web: My Listings page with inline applicant management, Engagement detail page with feedback form
- Admin: Analytics overview with CSS bar charts + weekly activity chart
- Admin: User detail page (profile, trust, enforcement history, audit log)
- Admin: `OpportunityDetailModal`, `Pagination` component, `exportToCsv` utility
- Admin: Governance sessions list, conflict declarations viewer
- Admin: Audit log with expandable before/after diff viewer
- 17 controller unit test files covering all modules
- 7 E2E test files: auth, opportunities, engagements, trust, moderation, search, health/analytics
- `docs/README.md` with ERD generation instructions

### Changed
- `api-client/src/client.ts` — auto-unwraps `TransformInterceptor` envelope transparently
- `app.module.ts` — `RequestIdMiddleware` + `SanitizeMiddleware` applied globally
- `main.ts` — uses `AppLogger`, full Swagger tag descriptions, `IoAdapter` for Socket.io
- All services rewritten with real Prisma queries (in-memory stubs removed)
- `EngagementsService` — closing a COMPLETED engagement increments `completedEngagements` in trust records
- `OpportunitiesService` — publish triggers search index sync + notification queue jobs
- `auth.store.ts` — decodes `userId` from JWT client-side, sets `access_token` cookie for middleware

### Fixed
- `FeedbackSchema` duplicate declaration in validators
- `getPendingVerifications()` was outside class brace in TrustService
- `getMemberConflicts()` was outside class brace in GovernanceController
- `api-client` response interceptor now unwraps `{ data, statusCode, timestamp }` envelope
- Admin analytics page had broken relative import (`../../../lib/utils` → `@/lib/utils`)
- Login/register pages: `setTokens` no longer requires manual `userId` parameter

---

## [0.1.0] — Initial skeleton

### Added
- Turborepo monorepo with `apps/api`, `apps/web`, `apps/admin`, `packages/types`, `packages/validators`, `packages/api-client`
- NestJS backend with all 9 domain modules: auth, users, trust, opportunities, engagements, moderation, governance, notifications, audit
- Prisma schema with 16 tables + full relations, indexes, and enums
- PostgreSQL + Redis + Meilisearch `docker-compose.yml`
- GitHub Actions CI: lint → typecheck → unit tests → E2E tests → build → Docker
- Husky pre-commit hooks (lint-staged) and commit-msg (conventional commits)
- ESLint + Prettier configuration
- `.env.example` with all required environment variables documented
