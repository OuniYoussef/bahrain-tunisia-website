import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
/** Content is composed by the caller: media, heading, body and actions have no fixed slots. */
export function Card({ className, ...props }: ComponentProps<'article'>) {
  return <article {...props} className={cn('ui-card tone-pearl', className)} />;
}
