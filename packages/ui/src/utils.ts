import { clsx, type ClassValue } from 'clsx';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}

/** Format a Date to a readable string in en-IN locale */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

/** Format a Date to date + time */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/** Truncate a string to n chars with ellipsis */
export function truncate(text: string, n: number): string {
  return text.length > n ? `${text.slice(0, n)}…` : text;
}

/** Convert a snake_case or SCREAMING_CASE string to Title Case */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Map ModuleType enum value to a readable label */
export function moduleTypeLabel(type: string): string {
  const map: Record<string, string> = {
    EMPLOYMENT_EXCHANGE:  'Employment',
    AGENCY_STAFF_AUG:     'Agency / Staffing',
    PROJECT_TENDER:       'Project & Tender',
    CONSULTANCY_ADVISORY: 'Consultancy',
    SERVICE_ENGAGEMENT:   'Service Roles',
    VENDOR_MARKETPLACE:   'Vendor & Marketplace',
    TRAINING_SKILL_DEV:   'Training',
    STARTUP_INNOVATION:   'Startup & Innovation',
    VOLUNTEER_SOCIAL:     'Volunteer',
  };
  return map[type] ?? toTitleCase(type);
}

/** Map TrustLevel enum value to a readable label */
export function trustLevelLabel(level: string): string {
  const map: Record<string, string> = {
    L0_REGISTERED:              'L0 — Registered',
    L1_DOCUMENT_VERIFIED:       'L1 — Document Verified',
    L2_FOUNDATION_SCREENED:     'L2 — Foundation Screened',
    L3_DOMAIN_EXPERT_CERTIFIED: 'L3 — Expert Certified',
    L4_COMMUNITY_ENDORSED:      'L4 — Community Endorsed',
  };
  return map[level] ?? level;
}

/** Map opportunity/application/engagement status to a display variant */
export function statusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
    PUBLISHED:   'success',
    COMPLETED:   'success',
    ACCEPTED:    'success',
    ACTIVE:      'success',
    MODERATION:  'warning',
    PENDING:     'warning',
    SHORTLISTED: 'info',
    INITIATED:   'info',
    IN_PROGRESS: 'info',
    REJECTED:    'danger',
    SUSPENDED:   'danger',
    CANCELLED:   'neutral',
    CLOSED:      'neutral',
    WITHDRAWN:   'neutral',
    DRAFT:       'neutral',
  };
  return map[status.toUpperCase()] ?? 'neutral';
}
