import { cn } from '@/lib/cn';
const patterns = {
  khatam: 'pattern-khatam',
  mashrabiya: 'pattern-mashrabiya',
  sadu: 'pattern-sadu',
  serrated: 'pattern-serrated',
};
export function Pattern({ kind, className }: { kind: keyof typeof patterns; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        patterns[kind],
        kind === 'sadu' || kind === 'serrated' ? 'h-6' : 'h-32 opacity-[0.06]',
        className,
      )}
    />
  );
}
