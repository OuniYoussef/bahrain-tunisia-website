import { useRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useContent } from '@/i18n/content';
import { cn } from '@/lib/cn';
import { VisuallyHidden } from './VisuallyHidden';
import { pauseOutside } from '@/lib/ambient';
export function Spinner({ className }: { className?: string }) {
  const root = useRef<HTMLOutputElement>(null);
  const { ui } = useContent('common');
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (ctx.conditions?.motion && root.current) {
            const rotation = gsap.to('svg', {
              rotation: 360,
              duration: 1.2,
              repeat: -1,
              ease: 'none',
              paused: true,
            });
            return pauseOutside(root.current, rotation);
          }
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );
  return (
    <output ref={root} className={cn('inline-flex items-center', className)}>
      <LoaderCircle aria-hidden="true" size={24} />
      <VisuallyHidden>{ui.loading}</VisuallyHidden>
    </output>
  );
}
