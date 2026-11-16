import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';
type Props = ComponentProps<'section'> & { tone?: 'pearl' | 'sand' | 'ink' };
export function Section({ tone = 'pearl', className, ...props }: Props) {
  return <section {...props} className={cn('ui-section', `tone-${tone}`, className)} />;
}
