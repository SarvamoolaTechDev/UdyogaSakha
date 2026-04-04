# @udyogasakha/admin

Next.js 14 governance and moderation portal — restricted to authorised Foundation personnel.

## Quick start

```bash
npm install
cp apps/admin/.env.example apps/admin/.env.local
npx turbo run dev --filter=@udyogasakha/admin
```

Runs at `http://localhost:3002`  
Login at `http://localhost:3002/login`

Default dev credentials (from seed):
- Email: `admin@udyogasakha.org`
- Password: `ChangeMe@123`

## Page map

| Route | Role | Description |
|-------|------|-------------|
| `/login` | Public | Admin-only sign in (credentials stored in sessionStorage) |
| `/analytics` | Admin/Moderator | Platform overview stats + charts + CSV export |
| `/moderation` | Admin/Moderator | Opportunity review queue + reports queue |
| `/trust` | Admin/Moderator | L1 verification request queue + badge management |
| `/users` | Admin/Moderator | User search, detail view, enforcement actions |
| `/users/[id]` | Admin/Moderator | Full user profile, trust, enforcement history, audit log |
| `/governance` | Admin | EGC/DEP/Moderation council member management |
| `/governance/sessions` | Admin/Governance | DEP screening session scheduling + outcomes |
| `/governance/conflicts` | Admin | Conflict of interest declaration lookup |
| `/audit` | Admin/Moderator | Audit log viewer with entity/actor search + diff viewer |

## Key components

- `OpportunityModerationTable` — approve/reject with modal + reject reason
- `OpportunityDetailModal` — full opportunity view before approve/reject decision
- `UserTable` — search results with enforce action modal
- `AuditLogTable` — expandable before/after diff viewer
- `Pagination` — shared pagination component for all tables

## Auth

Admin auth uses `sessionStorage` (not `localStorage`) so credentials are cleared when the browser tab closes. The API client reads the token via `getAdminToken()` on every request.

## Environment variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3002
```
