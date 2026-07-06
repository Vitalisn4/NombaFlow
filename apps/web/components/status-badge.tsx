import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  ACTIVE: 'bg-[var(--badge-active-bg)] text-[var(--badge-active-text)]',
  PAST_DUE: 'bg-[var(--badge-past-due-bg)] text-[var(--badge-past-due-text)]',
  DUNNING: 'bg-[var(--badge-dunning-bg)] text-[var(--badge-dunning-text)]',
  SUSPENDED: 'bg-[var(--badge-suspended-bg)] text-[var(--badge-suspended-text)]',
  CANCELLED: 'bg-[var(--badge-cancelled-bg)] text-[var(--badge-cancelled-text)]',
  PENDING: 'bg-[var(--badge-pending-bg)] text-[var(--badge-pending-text)]',
} as const;

export type SubscriptionStatus = keyof typeof STATUS_STYLES;

type StatusBadgeProps = {
  status: SubscriptionStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status],
        className,
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
