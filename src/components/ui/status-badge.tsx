import { cn } from '@/lib/utils';
import { UserStatus, InviteStatus } from '@/types';

interface StatusBadgeProps {
  status: UserStatus | InviteStatus;
  className?: string;
}

const statusConfig: Record<UserStatus | InviteStatus, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-success/10 text-success border-success/20',
  },
  invited: {
    label: 'Invited',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  suspended: {
    label: 'Suspended',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-success/10 text-success border-success/20',
  },
  revoked: {
    label: 'Revoked',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  expired: {
    label: 'Expired',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
