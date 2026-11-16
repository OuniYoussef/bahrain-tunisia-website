import { useRef } from 'react';
import { useContent, useLocale } from '@/i18n/content';
import { Section } from '@/components/ui/Section';
import { Flag } from '@/components/media/Flag';
import { gsap, useGSAP } from '@/lib/gsap';
import { UnitedSectionHeader } from '../UnitedSectionHeader';

export function Glance() {
  const { glance } = useContent('united');
  const locale = useLocale();
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (!ctx.conditions?.motion) return;
          const rows = gsap.utils.toArray<HTMLElement>('tbody tr', root.current);
          for (let index = 0; index < rows.length; index += 3) {
            gsap.from(rows.slice(index, index + 3), {
              opacity: 0,
              y: 12,
              stagger: 0.08,
              scrollTrigger: { trigger: rows[index], start: 'top 95%', once: true },
            });
          }
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [locale], revertOnUpdate: true },
  );
  return (
    <Section ref={root} id="glance">
      <div className="ui-container">
        <UnitedSectionHeader id="glance-title" eyebrow={glance.eyebrow} title={glance.title} />
        {/* Keyboard users need a focusable native horizontal scroll region. */}
        {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <section className="glance-scroll" aria-label={glance.caption} tabIndex={0}>
          <table className="glance-table">
            <caption className="sr-only">{glance.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{glance.columns.topic}</th>
                {(['tunisia', 'bahrain'] as const).map((country) => (
                  <th key={country} scope="col">
                    <span>
                      <Flag country={country} decorative size="lg" />
                      {glance.columns[country]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {glance.rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{row.label}</th>
                  <td>{row.tunisia}</td>
                  <td>{row.bahrain}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </Section>
  );
}
