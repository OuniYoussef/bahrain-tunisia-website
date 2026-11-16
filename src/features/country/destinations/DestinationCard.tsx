import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { UnescoBadge } from '@/components/ui/Badge';
import { useContent } from '@/i18n/content';
import type { Destination } from '../types';
export function DestinationCard({
  item,
  onOpen,
}: {
  item: Destination;
  onOpen: (item: Destination) => void;
}) {
  const { ui } = useContent('common');
  return (
    <article
      id={`destination-${item.id}`}
      className="destination-card"
      aria-labelledby={`destination-title-${item.id}`}
    >
      <ResponsiveImage
        id={item.media.image}
        alt=""
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 60vw, 82vw"
      />
      <div className="destination-card-copy">
        <h3 id={`destination-title-${item.id}`} className="text-h3">
          {item.title}
        </h3>
        {item.media.unesco && <UnescoBadge />}
        <p>{item.text}</p>
        <button
          type="button"
          className="destination-read-more"
          aria-haspopup="dialog"
          aria-labelledby={`read-${item.id} destination-title-${item.id}`}
          onClick={() => onOpen(item)}
        >
          <span id={`read-${item.id}`}>{ui.readMore}</span>
        </button>
      </div>
    </article>
  );
}
