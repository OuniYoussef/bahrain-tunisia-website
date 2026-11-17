import { type ComponentProps } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DUR, STAGGER, gsap, useGSAP } from '@/lib/gsap';
import { useNearViewport } from '@/components/media/useNearViewport';
import { SplitText } from '@/lib/gsap-plugins';
import { useLocale } from '@/i18n/content';

export function UnitedSectionHeader(props: ComponentProps<typeof SectionHeader>) {
  const { root, near } = useNearViewport<HTMLDivElement>();
  const locale = useLocale();
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (!near || !ctx.conditions?.motion || !root.current) return;
          const heading = root.current.querySelector('h2');
          if (!heading) return;
          const split = SplitText.create(heading, {
            type: locale === 'ar' ? 'lines' : 'lines,words',
            mask: 'lines',
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.lines, {
                yPercent: 100,
                opacity: 0,
                stagger: STAGGER,
                duration: DUR.base,
                scrollTrigger: { trigger: root.current, start: 'top 88%', once: true },
              });
            },
          });
          gsap.from('.section-header-rule', {
            scaleX: 0,
            transformOrigin: locale === 'ar' ? '100% 50%' : '0% 50%',
            scrollTrigger: { trigger: root.current, start: 'top 88%', once: true },
          });
          const intro = root.current.querySelector('header > div:last-child');
          if (props.intro && intro)
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
    { scope: root, dependencies: [locale, near], revertOnUpdate: true },
  );
  return (
    <div ref={root} className="united-section-header">
      <span className="section-header-rule" aria-hidden="true" />
      <SectionHeader {...props} />
    </div>
  );
}
