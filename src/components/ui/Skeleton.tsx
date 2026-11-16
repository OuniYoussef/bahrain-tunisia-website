import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} aria-hidden="true" className={cn('min-h-6 rounded-md bg-sand-100', className)} />;
}
