# @udyogasakha/ui

Shared React component library used by `apps/web` and `apps/admin`.

## Components

| Component | Description |
|-----------|-------------|
| `TrustBadge` | L0–L4 trust level coloured pill. Props: `level`, `size` (sm/md/lg), `className` |
| `ModuleChip` | Opportunity module type coloured chip. Props: `moduleType`, `className` |
| `Skeleton` | Loading placeholder. Variants: `SkeletonCard`, `SkeletonRow`, `SkeletonTable` |
| `EmptyState` | Empty list placeholder with optional CTA. Props: `title`, `description`, `action` |
| `StatusBadge` | Generic coloured status pill. Props: `label`, `variant` (success/warning/danger/info/neutral) |

## Utilities

| Function | Description |
|----------|-------------|
| `cn(...classes)` | Merge Tailwind classes safely (clsx + tailwind-merge) |
| `formatDate(date)` | Format date to en-IN locale (e.g. "12 Jan 2025") |
| `formatDateTime(date)` | Format date + time to en-IN locale |
| `truncate(text, n)` | Truncate to n chars with ellipsis |
| `moduleTypeLabel(type)` | EMPLOYMENT_EXCHANGE → "Employment" |
| `trustLevelLabel(level)` | L1_DOCUMENT_VERIFIED → "L1 — Document Verified" |
| `statusVariant(status)` | PUBLISHED → "success", REJECTED → "danger", etc. |
| `toTitleCase(str)` | snake_case → Title Case |

## Usage

```tsx
import { TrustBadge, ModuleChip, formatDate, cn } from '@udyogasakha/ui';

<TrustBadge level="L2_FOUNDATION_SCREENED" size="sm" />
<ModuleChip moduleType="EMPLOYMENT_EXCHANGE" />
<p>{formatDate(opportunity.publishedAt)}</p>
```

## Adding new components

Add to `packages/ui/src/components/`, export from `packages/ui/src/index.ts`.
The package uses Tailwind utility classes — consuming apps must have Tailwind configured.
