
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
  fullHeight?: boolean;
}

const DashboardCard = ({
  title,
  subtitle,
  className,
  children,
  footer,
  fullHeight = false,
}: DashboardCardProps) => {
  return (
    <div className={cn('crm-card', fullHeight && 'h-full flex flex-col', className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="font-semibold text-lg">{title}</h3>}
          {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>
      )}
      <div className={cn('', fullHeight && 'flex-1')}>{children}</div>
      {footer && <div className="mt-4 pt-3 border-t">{footer}</div>}
    </div>
  );
};

export default DashboardCard;
