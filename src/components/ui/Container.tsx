import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={cn('ui-container', className)} />;
}
