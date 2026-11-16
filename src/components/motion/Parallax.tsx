import { useRef, type ComponentProps } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { cn } from '@/lib/cn';
import { useLocale } from '@/i18n/content';
export function Parallax({ children, className, ...props }: ComponentProps<'div'>) {
  const root = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (!ctx.conditions?.motion) return;
          gsap.fromTo(
            inner.current,
            { yPercent: -4, scale: 1.12 },
            {
              yPercent: 4,
              scale: 1.12,
              ease: 'none',
              scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [locale], revertOnUpdate: true },
  );
  return (
    <div {...props} ref={root} className={cn('overflow-hidden', className)}>
      <div ref={inner}>{children}</div>
    </div>
  );
}
