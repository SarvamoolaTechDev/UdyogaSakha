import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date for display */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date));
}

/** Truncate text to n chars with ellipsis */
export function truncate(text: string, n: number): string {
  return text.length > n ? `${text.slice(0, n)}…` : text;
}

/** Map trust level enum value to display label */
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

/** Map module type enum to readable label */
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
  return map[type] ?? type;
}
