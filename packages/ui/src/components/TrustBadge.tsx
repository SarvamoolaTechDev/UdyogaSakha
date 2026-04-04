import { clsx } from 'clsx';

const levelConfig: Record<string, { label: string; color: string; border: string }> = {
  L0_REGISTERED:              { label: 'L0 — Registered',       color: 'text-gray-600  bg-gray-100',   border: 'border-gray-200'  },
  L1_DOCUMENT_VERIFIED:       { label: 'L1 — Verified',         color: 'text-blue-700  bg-blue-50',    border: 'border-blue-200'  },
  L2_FOUNDATION_SCREENED:     { label: 'L2 — Screened',         color: 'text-teal-700  bg-teal-50',    border: 'border-teal-200'  },
  L3_DOMAIN_EXPERT_CERTIFIED: { label: 'L3 — Expert Certified', color: 'text-purple-700 bg-purple-50', border: 'border-purple-200'},
  L4_COMMUNITY_ENDORSED:      { label: 'L4 — Endorsed',         color: 'text-amber-700 bg-amber-50',   border: 'border-amber-200' },
};

export interface TrustBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TrustBadge({ level, size = 'md', className }: TrustBadgeProps) {
  const config = levelConfig[level] ?? { label: level, color: 'text-gray-600 bg-gray-100', border: 'border-gray-200' };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium border rounded-full whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs'    : '',
        size === 'md' ? 'px-3 py-1 text-sm'      : '',
        size === 'lg' ? 'px-4 py-1.5 text-base'  : '',
        config.color,
        config.border,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
