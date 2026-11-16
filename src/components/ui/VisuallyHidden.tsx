import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
export function VisuallyHidden({ className, ...props }: ComponentProps<'span'>) {
  return <span {...props} className={cn('sr-only', className)} />;
}
