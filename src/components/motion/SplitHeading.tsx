import { useRef, type ComponentProps } from 'react';
import { useLocale } from '@/i18n/content';
import { gsap, useGSAP, DUR } from '@/lib/gsap';
import { SplitText } from '@/lib/gsap-plugins';
type Props = Omit<ComponentProps<'h2'>, 'children' | 'ref'> & { as?: 'h1' | 'h2' | 'h3'; children: string };
export function SplitHeading({ as: Tag = 'h2', children, ...props }: Props) {
  const root = useRef<HTMLHeadingElement>(null);
  const locale = useLocale();
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (!ctx.conditions?.motion || !root.current) return;
          const arabic = root.current.matches(':lang(ar)');
          const split = SplitText.create(root.current, {
            type: arabic ? 'lines' : 'lines,words',
            mask: 'lines',
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.lines, {
                yPercent: 100,
                opacity: 0,
                duration: DUR.base,
                stagger: 0.08,
                scrollTrigger: { trigger: root.current, start: 'top 90%', once: true },
              });
            },
          });
          return () => split.revert();
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [children, locale, props.lang], revertOnUpdate: true },
  );
  return (
    <Tag {...props} ref={root}>
      {children}
    </Tag>
  );
}
