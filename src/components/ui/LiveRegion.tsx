import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
export function LiveRegion({ className, 'aria-live': live = 'polite', ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      role={live === 'assertive' ? 'alert' : 'status'}
      aria-live={live}
      aria-atomic="true"
      className={cn('sr-only', className)}
    />
  );
}
