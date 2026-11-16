import { cn } from '@/lib/cn';
import { InlineSvg } from './InlineSvg';
/** Original stroke paths remain addressable with [data-svg-id] for DrawSVG. */
export function Ornament({ kind, className }: { kind: 'jasmine' | 'razji'; className?: string }) {
  return <InlineSvg asset={kind} className={cn('size-24', className)} />;
}
