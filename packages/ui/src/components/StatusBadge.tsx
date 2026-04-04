import { clsx } from 'clsx';

export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const variants: Record<StatusVariant, string> = {
  success: 'bg-teal-50  text-teal-700',
  warning: 'bg-yellow-50 text-yellow-700',
  danger:  'bg-red-50   text-red-700',
  info:    'bg-blue-50  text-blue-700',
  neutral: 'bg-gray-100 text-gray-600',
};

export interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
}

export function StatusBadge({ label, variant = 'neutral', className }: StatusBadgeProps) {
  return (
    <span className={clsx('inline-block text-xs font-medium px-2.5 py-0.5 rounded-full', variants[variant], className)}>
      {label}
    </span>
  );
}
