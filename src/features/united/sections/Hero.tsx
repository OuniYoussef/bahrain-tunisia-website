import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useContent, useLocale } from '@/i18n/content';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { Ornament } from '@/components/media/Ornament';
import { media } from '../media';
import { useHeroMotion } from '../useHeroMotion';

export function Hero() {
  const { hero, glance } = useContent('united');
  const locale = useLocale();
  const root = useRef<HTMLElement>(null);
  const [tunisia, bahrain] = media('united.hero').images;
  useHeroMotion(root);
  return (
    <section ref={root} className="united-hero tone-ink" aria-labelledby="united-title">
      <div className="hero-photographs" dir="ltr">
        <div className="hero-photo hero-photo-tn" data-half="tunisia">
          <ResponsiveImage
            id={tunisia!}
            alt=""
            priority
            mobileMaxWidth={1280}
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
        </div>
        <div className="hero-photo hero-photo-bh" data-half="bahrain">
          <ResponsiveImage
            id={bahrain!}
            alt=""
            priority
            mobileMaxWidth={1280}
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
        </div>
        <span className="hero-seam" aria-hidden="true" />
      </div>
      <div className="hero-flowers" aria-hidden="true" dir="ltr">
        <Ornament kind="jasmine" className="hero-flower hero-flower-jasmine" />
        <Ornament kind="razji" className="hero-flower hero-flower-razji" />
      </div>
      <div className="hero-content ui-container">
        <p className="hero-eyebrow">{hero.eyebrow}</p>
        <h1 id="united-title" className="text-display-xl" tabIndex={-1}>
          {hero.headline}
        </h1>
        <p className="hero-subheadline text-body-lg">{hero.subheadline}</p>
        <div className="hero-actions">
          <Link className="ui-button ui-button-primary" to={`/${locale}/common-grounds`}>
            {hero.exploreConnections}
          </Link>
          <Link className="ui-button ui-button-ghost" to={`/${locale}/vault`}>
            {hero.shareStory}
          </Link>
        </div>
        <nav className="hero-countries" aria-label={hero.eyebrow} dir="ltr">
          <Link to={`/${locale}/tunisia`} className="hero-country hero-country-tn" data-country="tunisia">
            <ArrowLeft aria-hidden="true" size={20} />
            <span dir={locale === 'ar' ? 'rtl' : 'ltr'}>{hero.discoverTunisia}</span>
          </Link>
          <Link to={`/${locale}/bahrain`} className="hero-country hero-country-bh" data-country="bahrain">
            <span dir={locale === 'ar' ? 'rtl' : 'ltr'}>{hero.discoverBahrain}</span>
            <ArrowRight aria-hidden="true" size={20} />
          </Link>
        </nav>
      </div>
      <div className="hero-outline-names" aria-hidden="true" dir="ltr">
        <span data-country-name="tunisia">{glance.columns.tunisia}</span>
        <span data-country-name="bahrain">{glance.columns.bahrain}</span>
      </div>
      <div className="hero-bottom ui-container">
        <p className="hero-caption">
          <span className="hero-caption-desktop">{hero.backgroundCaption}</span>
          <span className="hero-caption-mobile">{hero.backgroundCaptionStacked}</span>
        </p>
        <a className="hero-scroll" href="#welcome">
          <span>{hero.scrollHint}</span>
          <ArrowDown size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
