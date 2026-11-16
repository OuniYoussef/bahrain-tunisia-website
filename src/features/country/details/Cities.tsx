import { Parallax } from '@/components/motion/Parallax';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import type { CountryContent } from '../types';
import type { Country } from '../country.config';
import { media } from '../detail-media';
import { CardImage } from './InfoCard';
import { PlaceLink } from './PlaceMap';

export function Cities({ country, content }: { country: Country; content: CountryContent['cities'] }) {
  return (
    <div className="city-rows">
      {content.items.map((item, index) => {
        const image = media(`${country}.cities.items`, item.id);
        return (
          <article
            key={item.id}
            id={`city-${item.id}`}
            data-item-id={item.id}
            className={`city-row ${index === 0 ? 'city-capital' : ''}`}
          >
            {index === 0 ? (
              <div className="city-capital-images">
                <Parallax>
                  <CardImage media={image} country={country} sizes="(min-width: 1440px) 1312px, 92vw" />
                </Parallax>
                {country === 'bahrain' && (
                  <div className="city-nightlife">
                    <ResponsiveImage
                      id={media('bahrain.cities').nightlifeImage}
                      sizes="(min-width: 768px) 30vw, 60vw"
                    />
                  </div>
                )}
              </div>
            ) : (
              <CardImage media={image} country={country} sizes="(min-width: 768px) 44vw, 90vw" />
            )}
            <div className="city-copy">
              <h3 className={index === 0 ? 'text-h2' : 'text-h3'}>{item.title}</h3>
              {item.text && <p>{item.text}</p>}
              <PlaceLink id={`city-${item.id}`} title={item.title} media={image} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
