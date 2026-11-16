import { Coffee } from 'lucide-react';
import type { Content } from '@/i18n/content';
import { media } from '../detail-media';
import { CardImage } from './InfoCard';

export function ArabicCoffee({ content }: { content: Content['bahrain']['food']['coffee'] }) {
  return (
    <section className="coffee-feature" aria-labelledby="coffee-title">
      <CardImage
        country="bahrain"
        media={media('bahrain.food.coffee')}
        sizes="(min-width: 768px) 44vw, 90vw"
      />
      <div>
        <h3 className="text-h2" id="coffee-title">
          {content.title}
        </h3>
        <p className="text-body-lg">{content.text}</p>
        <aside className="coffee-etiquette">
          <Coffee aria-hidden="true" size={28} />
          <p>{content.etiquette}</p>
        </aside>
      </div>
    </section>
  );
}
