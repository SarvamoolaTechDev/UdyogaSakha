import { cn } from '@/lib/utils';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center px-6', className)}>
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <span className="text-2xl">○</span>
      </div>
      <h3 className="font-medium text-gray-700">{title}</h3>
      {description && <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-4 px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#178a64] transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
