import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
export function ArchFrame({
  shape = 'round',
  className,
  ...props
}: ComponentProps<'div'> & { shape?: 'round' | 'horseshoe' }) {
  return <div {...props} className={cn('ui-arch', `ui-arch-${shape}`, className)} />;
}
