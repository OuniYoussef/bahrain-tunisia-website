import { useState } from 'react';
import { useContent } from '@/i18n/content';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import type { ImageId } from '@/lib/images';
import type { CountryContent, PlaceText } from '../types';
import type { Country } from '../country.config';
import { media, type CardMedia } from '../detail-media';
import { CardImage } from './InfoCard';
import { useDesktop } from './useDesktop';
import { ArabicCoffee } from './ArabicCoffee';

export function DishGrid({
  items,
  country,
  nationalDish,
}: {
  items: (PlaceText & { media: CardMedia })[];
  country: Country;
  nationalDish: boolean;
}) {
  return (
    <div className="dish-grid">
      {items.map((item, index) => (
        <article
          key={item.id}
          data-item-id={item.id}
          className={`dish-card ${nationalDish && index === 0 ? 'national-dish' : ''}`}
        >
          <CardImage media={item.media} country={country} />
          <div>
            <h4 className="text-h4">{item.title}</h4>
            {item.text && <p>{item.text}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}
export function ProductStrip({ title, text, images }: { title: string; text: string; images: ImageId[] }) {
  return (
    <aside className="product-strip" aria-labelledby="products-title">
      <div>
        <h3 id="products-title" className="text-h3">
          {title}
        </h3>
        <p>{text}</p>
      </div>
      <div className="product-images">
        {images.map((id) => (
          <ResponsiveImage key={id} id={id} sizes="(min-width: 1024px) 14vw, 28vw" />
        ))}
      </div>
    </aside>
  );
}
export function Food({ country, content }: { country: Country; content: CountryContent['food'] }) {
  const [active, setActive] = useState('all');
  const desktop = useDesktop();
  const { ui } = useContent('common');
  return (
    <>
      {!desktop && content.groups.length > 1 && (
        <fieldset className="food-filters">
          <legend className="sr-only">{content.title}</legend>
          {[{ id: 'all', title: ui.seeAll }, ...content.groups].map((group) => (
            <button
              type="button"
              key={group.id}
              className="ui-pill"
              aria-pressed={active === group.id}
              onClick={() => setActive(group.id)}
            >
              {group.title}
            </button>
          ))}
        </fieldset>
      )}
      {content.groups.map((group, index) => (
        <section
          key={group.id}
          className="food-group"
          data-food-group={group.id}
          aria-labelledby={`food-${group.id}-title`}
          hidden={!desktop && active !== 'all' && active !== group.id}
        >
          <h3 className="text-h3" id={`food-${group.id}-title`}>
            {group.title}
          </h3>
          <DishGrid
            country={country}
            nationalDish={index === 0}
            items={group.items.map((item) => ({
              ...item,
              media: media(`${country}.food.groups.${group.id}.items`, item.id),
            }))}
          />
        </section>
      ))}
      {'coffee' in content && <ArabicCoffee content={content.coffee} />}
      <ProductStrip
        title={content.productsTitle}
        text={content.products}
        images={media(`${country}.food`).productImages}
      />
    </>
  );
}
