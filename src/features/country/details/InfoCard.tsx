import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { Pattern } from '@/components/media/Pattern';
import { Ornament } from '@/components/media/Ornament';
import { UnescoBadge } from '@/components/ui/Badge';
import type { CardMedia } from '../detail-media';
import type { PlaceText } from '../types';
import type { Country } from '../country.config';
import { PlaceLink } from './PlaceMap';

export function CardImage({
  media,
  country,
  portrait = false,
  sizes = '(min-width: 1024px) 30vw, (min-width: 640px) 44vw, 88vw',
}: {
  media: CardMedia;
  country: Country;
  portrait?: boolean;
  sizes?: string;
}) {
  return media.image ? (
    <ResponsiveImage
      id={media.image}
      className={portrait ? 'detail-portrait' : 'detail-landscape'}
      sizes={sizes}
    />
  ) : (
    <div className={`detail-khatam ${portrait ? 'detail-portrait' : 'detail-landscape'}`} aria-hidden="true">
      <Pattern kind="khatam" className="absolute inset-0 h-full w-full" />
      <Ornament kind={country === 'tunisia' ? 'jasmine' : 'razji'} />
    </div>
  );
}

export function InfoCard({
  item,
  media,
  country,
  id,
  portrait,
  headingLevel = 4,
}: {
  item: PlaceText;
  media: CardMedia;
  country: Country;
  id: string;
  portrait?: boolean;
  headingLevel?: 3 | 4;
}) {
  const Heading = headingLevel === 3 ? 'h3' : 'h4';
  return (
    <article id={id} className="info-card" data-item-id={item.id}>
      <CardImage media={media} country={country} portrait={portrait} />
      <div className="info-card-copy">
        {media.unesco && <UnescoBadge year={media.badgeYear} />}
        <Heading className="text-h4">{item.title}</Heading>
        {item.text && <p>{item.text}</p>}
        {media.place && <PlaceLink id={id} title={item.title} media={media} />}
      </div>
    </article>
  );
}
