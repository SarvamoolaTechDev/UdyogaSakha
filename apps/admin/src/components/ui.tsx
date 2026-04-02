// TrustBadge
const levelConfig: Record<string, { label: string; color: string }> = {
  L0_REGISTERED:              { label: 'L0', color: 'bg-gray-100 text-gray-600' },
  L1_DOCUMENT_VERIFIED:       { label: 'L1 Verified', color: 'bg-blue-50 text-blue-700' },
  L2_FOUNDATION_SCREENED:     { label: 'L2 Screened', color: 'bg-teal-50 text-teal-700' },
  L3_DOMAIN_EXPERT_CERTIFIED: { label: 'L3 Certified', color: 'bg-purple-50 text-purple-700' },
  L4_COMMUNITY_ENDORSED:      { label: 'L4 Endorsed', color: 'bg-amber-50 text-amber-700' },
};

export function TrustBadge({ level, size = 'md' }: { level: string; size?: 'sm' | 'md' }) {
  const c = levelConfig[level] ?? { label: level, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-block font-medium rounded-full border border-current/20 ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} ${c.color}`}>
      {c.label}
    </span>
  );
}

// ModuleChip
const moduleColors: Record<string, string> = {
  EMPLOYMENT_EXCHANGE: 'bg-blue-50 text-blue-700',
  AGENCY_STAFF_AUG: 'bg-indigo-50 text-indigo-700',
  PROJECT_TENDER: 'bg-violet-50 text-violet-700',
  CONSULTANCY_ADVISORY: 'bg-purple-50 text-purple-700',
  SERVICE_ENGAGEMENT: 'bg-teal-50 text-teal-700',
  VENDOR_MARKETPLACE: 'bg-green-50 text-green-700',
  TRAINING_SKILL_DEV: 'bg-cyan-50 text-cyan-700',
  STARTUP_INNOVATION: 'bg-orange-50 text-orange-700',
  VOLUNTEER_SOCIAL: 'bg-rose-50 text-rose-700',
};

const moduleLabels: Record<string, string> = {
  EMPLOYMENT_EXCHANGE: 'Employment', AGENCY_STAFF_AUG: 'Agency',
  PROJECT_TENDER: 'Project/Tender', CONSULTANCY_ADVISORY: 'Consultancy',
  SERVICE_ENGAGEMENT: 'Service Roles', VENDOR_MARKETPLACE: 'Vendor',
  TRAINING_SKILL_DEV: 'Training', STARTUP_INNOVATION: 'Startup',
  VOLUNTEER_SOCIAL: 'Volunteer',
};

export function ModuleChip({ moduleType }: { moduleType: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${moduleColors[moduleType] ?? 'bg-gray-100 text-gray-600'}`}>
      {moduleLabels[moduleType] ?? moduleType}
    </span>
  );
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function truncate(text: string, n: number): string {
  return text.length > n ? `${text.slice(0, n)}…` : text;
}
