# @udyogasakha/web

Next.js 14 member portal — the public-facing web application.

## Quick start

```bash
# From monorepo root
npm install

# Copy env vars
cp apps/web/.env.example apps/web/.env.local

# Start in dev mode
npx turbo run dev --filter=@udyogasakha/web
```

Runs at `http://localhost:3000`

## Page map

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Public | Landing page — module showcase + trust explainer |
| `/browse` | Public | SSR opportunity browse — SEO-friendly, shareable URLs |
| `/login` | Public | Sign in |
| `/register` | Public | Create account |
| `/dashboard` | Required | Personalised overview — stats, active engagements |
| `/opportunities` | Required | Browse + search with module filter chips |
| `/opportunities/[id]` | Required | Opportunity detail + apply modal |
| `/opportunities/new` | Required | 3-step create opportunity wizard |
| `/opportunities/my` | Required | My listings with inline applicant management |
| `/engagements` | Required | My applications + active engagements |
| `/engagements/[id]` | Required | Engagement detail + feedback submission |
| `/profile` | Required | Profile edit + trust badge widget |
| `/settings` | Required | Privacy settings + DPDP account deletion |

## Key components

- `TrustBadge` — L0–L4 trust level pill (from `@udyogasakha/ui`)
- `ModuleChip` — coloured module type chip (from `@udyogasakha/ui`)
- `OpportunityCard` — browsable listing card with apply action
- `TrustBadgeWidget` — full trust status card with next-step guidance
- `CreateOpportunityForm` — 3-step module-aware wizard
- `ApplyModal` — apply with optional cover message
- `NotificationsBell` — WS real-time + REST polling, mark-all-read
- `Toast` — in-app feedback toasts (success / error / info)

## Auth flow

1. User registers or logs in → `AuthTokens` returned from API
2. `useAuthStore` (Zustand + persisted) stores tokens, decodes `userId` from JWT
3. `access_token` cookie set for Next.js `middleware.ts` to read
4. `middleware.ts` redirects unauthenticated users away from protected routes

## Environment variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
