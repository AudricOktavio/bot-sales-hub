
import { cn } from '@/lib/utils';

type BadgeStatus = 'new' | 'contacted' | 'interested' | 'closed' | 'active' | 'inactive' | 'pending' | 'warning' | 'error' | 'success';

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  className?: string;
}

const StatusBadge = ({ status, label, className }: StatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'new':
        return 'bg-crm-new text-white';
      case 'contacted':
        return 'bg-crm-contacted text-white';
      case 'interested':
        return 'bg-crm-interested text-white';
      case 'closed':
        return 'bg-crm-closed text-white';
      case 'active':
        return 'bg-green-500 text-white';
      case 'inactive':
        return 'bg-gray-400 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'warning':
        return 'bg-amber-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        getStatusStyles(),
        className
      )}
    >
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
