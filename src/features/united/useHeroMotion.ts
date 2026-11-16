import type { RefObject } from 'react';
import { useLocale } from '@/i18n/content';
import { gsap, useGSAP, DUR } from '@/lib/gsap';
import { SplitText, DrawSVGPlugin } from '@/lib/gsap-plugins';

gsap.registerPlugin(SplitText, DrawSVGPlugin);
export function useHeroMotion(root: RefObject<HTMLElement | null>) {
  const locale = useLocale();
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          reduce: '(prefers-reduced-motion: reduce)',
          desktop: '(min-width: 1024px)',
        },
        (ctx) => {
          if (!ctx.conditions?.motion || !root.current) return;
          const desktop = ctx.conditions.desktop;
          const opening = gsap.timeline({ defaults: { duration: DUR.slow } });
          opening
            .from('.hero-photographs', { clipPath: desktop ? 'inset(0 50% 0 50%)' : 'inset(50% 0 50% 0)' }, 0)
            .from(
              '.hero-flower path, .hero-flower circle, .hero-flower ellipse',
              { drawSVG: '0%', stagger: 0.025 },
              0.2,
            )
            .from(
              '.hero-eyebrow, .hero-subheadline, .hero-actions',
              { opacity: 0, y: 16, stagger: 0.12, duration: 0.8 },
              0.3,
            );
          const heading = root.current.querySelector('h1');
          const split = heading
            ? SplitText.create(heading, {
                type: locale === 'ar' ? 'lines' : 'lines,words',
                mask: 'lines',
                autoSplit: true,
                onSplit(self) {
                  return gsap.from(self.lines, { yPercent: 100, opacity: 0, duration: 1.1, stagger: 0.1 });
                },
              })
            : undefined;
          const cleanups: (() => void)[] = [];
          if (desktop) {
            for (const country of ['tunisia', 'bahrain'] as const) {
              const tn = country === 'tunisia';
              const tween = gsap
                .timeline({ paused: true, defaults: { duration: DUR.fast, ease: 'power3.inOut' } })
                .to(
                  '.hero-photo-tn',
                  { clipPath: `inset(0 ${tn ? 42 : 58}% 0 0)`, opacity: tn ? 1 : 0.68 },
                  0,
                )
                .to(
                  '.hero-photo-bh',
                  { clipPath: `inset(0 0 0 ${tn ? 58 : 42}%)`, opacity: tn ? 0.68 : 1 },
                  0,
                )
                .to(
                  '.hero-seam, .hero-flowers',
                  { x: () => root.current!.clientWidth * (tn ? 0.08 : -0.08) },
                  0,
                )
                .to(`[data-country-name="${country}"]`, { opacity: 0.65 }, 0);
              const enter = () => {
                tween.invalidate().play();
              };
              const leave = () => {
                tween.reverse();
              };
              for (const target of root.current.querySelectorAll(
                `[data-half="${country}"], [data-country="${country}"]`,
              )) {
                target.addEventListener('pointerenter', enter);
                target.addEventListener('pointerleave', leave);
                target.addEventListener('focus', enter);
                target.addEventListener('blur', leave);
                cleanups.push(() => {
                  target.removeEventListener('pointerenter', enter);
                  target.removeEventListener('pointerleave', leave);
                  target.removeEventListener('focus', enter);
                  target.removeEventListener('blur', leave);
                });
              }
            }
          }
          return () => {
            split?.revert();
            cleanups.forEach((cleanup) => cleanup());
          };
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [locale], revertOnUpdate: true },
  );
}
