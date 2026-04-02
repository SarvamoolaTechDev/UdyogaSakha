import { cn } from '@/lib/utils';

const levelConfig: Record<string, { label: string; color: string }> = {
  L0_REGISTERED:              { label: 'L0 Registered',      color: 'bg-gray-100 text-gray-600 border-gray-200' },
  L1_DOCUMENT_VERIFIED:       { label: 'L1 Verified',        color: 'bg-blue-50 text-blue-700 border-blue-200' },
  L2_FOUNDATION_SCREENED:     { label: 'L2 Screened',        color: 'bg-teal-50 text-teal-700 border-teal-200' },
  L3_DOMAIN_EXPERT_CERTIFIED: { label: 'L3 Expert Certified',color: 'bg-purple-50 text-purple-700 border-purple-200' },
  L4_COMMUNITY_ENDORSED:      { label: 'L4 Endorsed',        color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

interface TrustBadgeProps {
  level: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function TrustBadge({ level, size = 'md', className }: TrustBadgeProps) {
  const config = levelConfig[level] ?? { label: level, color: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
