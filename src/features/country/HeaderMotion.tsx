import type { RefObject } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { SplitText } from '@/lib/gsap-plugins';
import { useLocale } from '@/i18n/content';
export default function HeaderMotion({
  root,
  hasIntro,
}: {
  root: RefObject<HTMLDivElement | null>;
  hasIntro: boolean;
}) {
  const locale = useLocale();
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          const heading = root.current?.querySelector('h2');
          if (!ctx.conditions?.motion || !heading) return;
          const split = SplitText.create(heading, {
            type: locale === 'ar' ? 'lines' : 'lines,words',
            mask: 'lines',
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.lines, {
                yPercent: 100,
                opacity: 0,
                stagger: 0.08,
                duration: 0.8,
                scrollTrigger: { trigger: root.current, start: 'top 88%', once: true },
              });
            },
          });
          gsap.from('.section-header-rule', {
            scaleX: 0,
            transformOrigin: locale === 'ar' ? '100% 50%' : '0% 50%',
            scrollTrigger: { trigger: root.current, start: 'top 88%', once: true },
          });
          const intro = root.current?.querySelector('header > div:last-child');
          if (hasIntro && intro)
            gsap.from(intro, {
              opacity: 0,
              y: 16,
              scrollTrigger: { trigger: root.current, start: 'top 88%', once: true },
            });
          return () => split.revert();
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [locale, hasIntro], revertOnUpdate: true },
  );
  return null;
}
