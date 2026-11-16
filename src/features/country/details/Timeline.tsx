import { useId, useRef, useState } from 'react';
import { useContent, useLocale } from '@/i18n/content';
import { Button } from '@/components/ui/Button';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { gsap, useGSAP } from '@/lib/gsap';
import type { CardMedia } from '../detail-media';

type Event = { id: string; date: string; text: string; media: CardMedia };
export function Timeline({ events, title }: { events: Event[]; title: string }) {
  const { ui } = useContent('common');
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (!ctx.conditions?.motion) return;
          gsap.from('.timeline-line', {
            scaleY: 0,
            transformOrigin: 'center top',
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top 65%', end: 'bottom 70%', scrub: true },
          });
          root.current?.querySelectorAll<HTMLElement>('li:not([hidden])').forEach((event) => {
            gsap.from(event.querySelector('.timeline-dot'), {
              scale: 0.4,
              duration: 0.4,
              scrollTrigger: { trigger: event, start: 'top 85%', once: true },
            });
            const image = event.querySelector('.timeline-photo');
            if (image)
              gsap.fromTo(
                image,
                { yPercent: -3 },
                {
                  yPercent: 3,
                  ease: 'none',
                  scrollTrigger: { trigger: event, start: 'top bottom', end: 'bottom top', scrub: true },
                },
              );
          });
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [expanded, locale], revertOnUpdate: true },
  );
  return (
    <div className="country-timeline" ref={root}>
      <h3 className="text-h3" id={`${listId}-title`}>
        {title}
      </h3>
      <div className="timeline-track">
        <span className="timeline-line" aria-hidden="true" />
        <ol id={listId} aria-labelledby={`${listId}-title`}>
          {events.map((event, index) => (
            <li key={event.id} hidden={!expanded && index >= 10} data-item-id={event.id} tabIndex={-1}>
              <span className="timeline-dot" aria-hidden="true" />
              <div className="timeline-event">
                <h4 className="timeline-date">{event.date}</h4>
                <p>{event.text}</p>
                {event.media.image && (
                  <div className="timeline-photo">
                    <ResponsiveImage
                      id={event.media.image}
                      className="detail-thumbnail"
                      sizes="(min-width: 1024px) 30vw, 80vw"
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
      {events.length > 10 && (
        <Button
          variant="ghost"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? ui.showLess : ui.showMore}
        </Button>
      )}
    </div>
  );
}
