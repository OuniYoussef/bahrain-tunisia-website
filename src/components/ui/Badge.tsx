import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
import { useContent } from '@/i18n/content';
export function Badge({ className, ...props }: ComponentProps<'span'>) {
  return <span {...props} className={cn('ui-badge', className)} />;
}
export function UnescoBadge({ year, className }: { year?: number | string; className?: string }) {
  const { ui } = useContent('common');
  return (
    <Badge className={cn('ui-badge-unesco', className)}>
      {year ? ui.unescoYear.replace('{year}', String(year)) : ui.unescoLabel}
    </Badge>
  );
}
