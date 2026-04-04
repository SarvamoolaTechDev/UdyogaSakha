import { clsx } from 'clsx';

const colorMap: Record<string, string> = {
  EMPLOYMENT_EXCHANGE:  'bg-blue-50   text-blue-700',
  AGENCY_STAFF_AUG:     'bg-indigo-50 text-indigo-700',
  PROJECT_TENDER:       'bg-violet-50 text-violet-700',
  CONSULTANCY_ADVISORY: 'bg-purple-50 text-purple-700',
  SERVICE_ENGAGEMENT:   'bg-teal-50   text-teal-700',
  VENDOR_MARKETPLACE:   'bg-green-50  text-green-700',
  TRAINING_SKILL_DEV:   'bg-cyan-50   text-cyan-700',
  STARTUP_INNOVATION:   'bg-orange-50 text-orange-700',
  VOLUNTEER_SOCIAL:     'bg-rose-50   text-rose-700',
};

const labelMap: Record<string, string> = {
  EMPLOYMENT_EXCHANGE:  'Employment',
  AGENCY_STAFF_AUG:     'Agency',
  PROJECT_TENDER:       'Project / Tender',
  CONSULTANCY_ADVISORY: 'Consultancy',
  SERVICE_ENGAGEMENT:   'Service Roles',
  VENDOR_MARKETPLACE:   'Vendor',
  TRAINING_SKILL_DEV:   'Training',
  STARTUP_INNOVATION:   'Startup',
  VOLUNTEER_SOCIAL:     'Volunteer',
};

export interface ModuleChipProps {
  moduleType: string;
  className?: string;
}

export function ModuleChip({ moduleType, className }: ModuleChipProps) {
  return (
    <span
      className={clsx(
        'inline-block px-2 py-0.5 rounded text-xs font-medium',
        colorMap[moduleType] ?? 'bg-gray-100 text-gray-600',
        className,
      )}
    >
      {labelMap[moduleType] ?? moduleType}
    </span>
  );
}
