import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { useLocale, type Content } from '@/i18n/content';
import { formatNumber } from '@/i18n/format';
import { media } from '../detail-media';
import { useRef } from 'react';
import { dirSign, DUR, EASE, gsap, ScrollTrigger, STAGGER, useGSAP } from '@/lib/gsap';

export function PearlHeritage({ content }: { content: Content['bahrain']['history']['pearl'] }) {
  const locale = useLocale();
  const image = media('bahrain.history.pearl').image;
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (!ctx.conditions?.motion || !root.current) return;
          const numbers = Array.from(root.current.querySelectorAll<HTMLElement>('.pearl-number'));
          const labels = numbers.map((node) => node.textContent);
          // Build the museum sequence only when this deep section approaches the viewport.
          ScrollTrigger.create({
            trigger: root.current,
            start: 'top 85%',
            once: true,
            onEnter: () =>
              ctx.add(() => {
                const formatter = new Intl.NumberFormat(locale, {
                  minimumIntegerDigits: 2,
                  numberingSystem: 'latn',
                });
                const timeline = gsap.timeline({ defaults: { duration: DUR.slow, ease: EASE.reveal } });
                numbers.forEach((node, index) => {
                  const counter = { value: 0 };
                  timeline.to(
                    counter,
                    {
                      value: index + 1,
                      onUpdate: () => {
                        node.textContent = formatter.format(Math.round(counter.value));
                      },
                    },
                    index * STAGGER,
                  );
                });
                timeline.from(
                  root.current!.querySelector('.pearl-grade-fill'),
                  {
                    scaleX: 0,
                    transformOrigin: dirSign() === -1 ? '100% 50%' : '0% 50%',
                  },
                  0,
                );
                timeline.from(
                  root.current!.querySelectorAll('.pearl-scale li > span:first-child'),
                  {
                    scale: 0.8,
                    opacity: 0,
                    stagger: STAGGER,
                    duration: DUR.base,
                  },
                  0,
                );
              }),
          });
          return () =>
            numbers.forEach((node, index) => {
              node.textContent = labels[index] ?? '';
            });
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [locale], revertOnUpdate: true },
  );
  return (
    <section ref={root} className="pearl-museum tone-ink" aria-labelledby="pearl-title">
      <div className="pearl-museum-intro">
        <div>
          <h3 className="text-h2" id="pearl-title">
            {content.title}
          </h3>
          <p className="text-body-lg">{content.intro}</p>
        </div>
        {image && <ResponsiveImage id={image} sizes="(min-width: 1024px) 40vw, 85vw" />}
      </div>
      <div className="pearl-labels">
        {content.groups.map((group, index) => (
          <article key={group.id} data-pearl-label={group.id}>
            <span className="pearl-number" aria-hidden="true">
              {formatNumber(index + 1, locale, { minimumIntegerDigits: 2 })}
            </span>
            <h4 className="text-h3">{group.title}</h4>
            <p>{group.text}</p>
            {group.id === 'types' && (
              <figure className="pearl-scale">
                <div className="pearl-grade" aria-hidden="true">
                  <span className="pearl-grade-fill" />
                </div>
                <ol>
                  {content.scale.map((name, step) => (
                    <li key={name}>
                      <span
                        aria-hidden="true"
                        style={{ inlineSize: `${52 - step * 12}px`, blockSize: `${52 - step * 12}px` }}
                      />
                      <span>{name}</span>
                    </li>
                  ))}
                </ol>
                <figcaption>{content.scaleNote}</figcaption>
              </figure>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
