import { cn } from '@/lib/cn';
import { SvgArtwork } from './SvgArtwork';
import jasmine from '/images/svg/ornaments/ornament-jasmine-tunisia.svg?raw';
import razji from '/images/svg/ornaments/ornament-razji-bahrain.svg?raw';
/** Original stroke paths remain addressable with [data-svg-id] for DrawSVG. */
export function Ornament({ kind, className }: { kind: 'jasmine' | 'razji'; className?: string }) {
  return <SvgArtwork source={kind === 'jasmine' ? jasmine : razji} className={cn('size-24', className)} />;
}
