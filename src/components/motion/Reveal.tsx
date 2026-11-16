import { useRef, type ComponentProps } from 'react';
import { gsap, useGSAP, DUR } from '@/lib/gsap';
import { useLocale } from '@/i18n/content';
export function Reveal(props: ComponentProps<'div'>) {
  const root = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (ctx.conditions?.motion)
            gsap.from(root.current, {
              y: 24,
              opacity: 0,
              duration: DUR.base,
              scrollTrigger: { trigger: root.current, start: 'top 90%', once: true },
            });
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [locale], revertOnUpdate: true },
  );
  return <div {...props} ref={root} />;
}
