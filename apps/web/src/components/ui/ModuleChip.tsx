import { cn, moduleTypeLabel } from '@/lib/utils';

const colorMap: Record<string, string> = {
  EMPLOYMENT_EXCHANGE:  'bg-blue-50 text-blue-700',
  AGENCY_STAFF_AUG:     'bg-indigo-50 text-indigo-700',
  PROJECT_TENDER:       'bg-violet-50 text-violet-700',
  CONSULTANCY_ADVISORY: 'bg-purple-50 text-purple-700',
  SERVICE_ENGAGEMENT:   'bg-teal-50 text-teal-700',
  VENDOR_MARKETPLACE:   'bg-green-50 text-green-700',
  TRAINING_SKILL_DEV:   'bg-cyan-50 text-cyan-700',
  STARTUP_INNOVATION:   'bg-orange-50 text-orange-700',
  VOLUNTEER_SOCIAL:     'bg-rose-50 text-rose-700',
};

export function ModuleChip({ moduleType, className }: { moduleType: string; className?: string }) {
  return (
    <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', colorMap[moduleType] ?? 'bg-gray-100 text-gray-600', className)}>
      {moduleTypeLabel(moduleType)}
    </span>
  );
}
