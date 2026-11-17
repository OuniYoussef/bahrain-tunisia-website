import { useRef, type ComponentProps } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { cn } from '@/lib/cn';
import { useLocale } from '@/i18n/content';
import { useNearViewport } from '@/components/media/useNearViewport';
export function Parallax({ children, className, ...props }: ComponentProps<'div'>) {
  const { root, near } = useNearViewport<HTMLDivElement>();
  const inner = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (!near || !ctx.conditions?.motion) return;
          gsap.fromTo(
            inner.current,
            { yPercent: -6, scale: 1.16 },
            {
              yPercent: 6,
              scale: 1.16,
              ease: 'none',
              scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [locale, near], revertOnUpdate: true },
  );
  return (
    <div {...props} ref={root} className={cn('overflow-hidden', className)}>
      <div ref={inner}>{children}</div>
    </div>
  );
}
