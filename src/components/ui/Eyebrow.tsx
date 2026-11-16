import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
export function Eyebrow({ className, ...props }: ComponentProps<'p'>) {
  return <p {...props} className={cn('ui-eyebrow', className)} />;
}
