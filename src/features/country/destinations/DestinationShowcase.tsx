/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- This labelled scroll region provides arrow/Home/End keyboard navigation alongside its native buttons. */
import { useImperativeHandle, type ReactNode, type Ref } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useContent, useLocale } from '@/i18n/content';
import { Button } from '@/components/ui/Button';
import { DestinationCard } from './DestinationCard';
import { useDestinationTrack } from './useDestinationTrack';
import type { Destination } from '../types';
export type ShowcaseHandle = { select: (index: number, focus?: boolean) => void };
export function DestinationShowcase({
  items,
  label,
  activeId,
  onActive,
  onOpen,
  children,
  ref,
}: {
  items: Destination[];
  label: string;
  activeId: string;
  onActive: (id: string) => void;
  onOpen: (item: Destination) => void;
  children: ReactNode;
  ref: Ref<ShowcaseHandle>;
}) {
  const { ui } = useContent('common');
  const locale = useLocale();
  const { root, viewport, track, pinned, select, selectOnFocus } = useDestinationTrack(
    items.length,
    (index) => {
      if (items[index]) onActive(items[index].id);
    },
  );
  useImperativeHandle(ref, () => ({ select }));
  const index = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  );
  return (
    <div ref={root} className="destination-showcase" data-pinned={pinned}>
      {children}
      <div className="destination-showcase-content">
        <section
          ref={viewport}
          className="destination-viewport"
          aria-label={label}
          tabIndex={0}
          onKeyDown={(event) => {
            const step = locale === 'ar' ? -1 : 1;
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? items.length - 1
                  : event.key === 'ArrowRight'
                    ? index + step
                    : event.key === 'ArrowLeft'
                      ? index - step
                      : null;
            if (next === null) return;
            event.preventDefault();
            select(Math.max(0, Math.min(items.length - 1, next)), event.target !== event.currentTarget);
          }}
          onFocusCapture={(event) => {
            const card = (event.target as HTMLElement).closest('.destination-card');
            const next = items.findIndex((item) => `destination-${item.id}` === card?.id);
            if (next >= 0 && next !== index) selectOnFocus(next);
          }}
        >
          <div ref={track} className="destination-track">
            {items.map((item) => (
              <DestinationCard key={item.id} item={item} onOpen={onOpen} />
            ))}
          </div>
        </section>
        <div className="destination-controls">
          <Button
            variant="ghost"
            size="icon"
            aria-label={ui.previous}
            disabled={index === 0}
            onClick={() => select(index - 1)}
            icon={<ChevronLeft className="rtl:-scale-x-100" />}
          />
          <p aria-live="polite" aria-atomic="true">
            {items[index]?.title}
          </p>
          <Button
            variant="ghost"
            size="icon"
            aria-label={ui.next}
            disabled={index === items.length - 1}
            onClick={() => select(index + 1)}
            icon={<ChevronRight className="rtl:-scale-x-100" />}
          />
        </div>
      </div>
    </div>
  );
}
