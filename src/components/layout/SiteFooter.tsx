import { Link } from 'react-router';
import { ArrowUp } from 'lucide-react';
import { useContent, useLocale } from '@/i18n/content';
import { DeferredNewsletter } from './DeferredNewsletter';
import { DeferredSkyline } from './DeferredSkyline';
import { SocialLinks } from './SocialLinks';
import { hasSocialLinks } from './socials';
import { useState } from 'react';
import { unitLogos } from './brand';
import { MotionToggle } from '@/components/ui/MotionToggle';
const policies = [
  ['accessibility', 'https://www.ieee.org/accessibility_statement.html'],
  ['nondiscrimination', 'https://www.ieee.org/about/corporate/governance/p9-26.html'],
  ['ethics', 'http://www.ieee-ethics-reporting.org'],
  ['terms', 'https://www.ieee.org/about/help/site_terms_conditions.html'],
  ['privacy', 'https://privacy.ieee.org/policies'],
] as const;
export function SiteFooter() {
  const [year] = useState(() => new Date().getFullYear());
  const { footer, site, a11y } = useContent('common');
  const locale = useLocale();
  const home = `/${locale}`;
  const { columns, ieeeLinks } = footer;
  return (
    <footer className="site-footer tone-ink">
      <DeferredSkyline />
      <div className="ui-container footer-content">
        <DeferredNewsletter />
        <div className="footer-links">
          <div className="footer-about">
            <p className="text-h3">{site.name}</p>
            <p>{site.purpose}</p>
          </div>
          <nav aria-label={a11y.footerNav}>
            <div>
              <h2>{columns.quickLinks.title}</h2>
              <Link to={home}>{columns.quickLinks.united}</Link>
              <Link to={`${home}/tunisia`}>{columns.quickLinks.tunisia}</Link>
              <Link to={`${home}/bahrain`}>{columns.quickLinks.bahrain}</Link>
            </div>
            <div>
              <h2>{columns.explore.title}</h2>
              <Link to={`${home}/common-grounds`}>{columns.explore.commonGrounds}</Link>
              <Link to={`${home}/vault`}>{columns.explore.vault}</Link>
            </div>
            <div>
              <h2>{columns.connect.title}</h2>
              <Link to={`${home}/contact`}>{columns.connect.contact}</Link>
              {hasSocialLinks && <p>{columns.connect.follow}</p>}
              <SocialLinks />
            </div>
          </nav>
        </div>
        <div className="organised-by">
          <p>{footer.organisedBy}</p>
          {unitLogos.map((logo) => (
            <img key={logo.src} src={logo.src} alt={logo.name} width="140" height="60" loading="lazy" />
          ))}
        </div>
        <div className="ieee-footer">
          <nav aria-label={ieeeLinks.label}>
            <Link to={home}>{ieeeLinks.home}</Link>
            <Link to={`${home}/contact`}>{ieeeLinks.contact}</Link>
            {policies.map(([key, url]) => (
              <a key={key} href={url}>
                {ieeeLinks[key]}
              </a>
            ))}
            <Link to={`${home}/credits`}>{ieeeLinks.credits}</Link>
            <a href={`${import.meta.env.BASE_URL}sitemap.xml`}>{ieeeLinks.sitemap}</a>
          </nav>
          <div className="ieee-copy" lang="en" dir="ltr">
            <p>© Copyright {year} IEEE – All rights reserved.</p>
            <p>
              A public charity, IEEE is the world's largest technical professional organization dedicated to
              advancing technology for the benefit of humanity.
            </p>
          </div>
          <div className="footer-bottom">
            <MotionToggle className="back-to-top" />
            <p>{footer.projectLine}</p>
            <button
              type="button"
              className="back-to-top"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
                document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
              }}
            >
              <span>{a11y.backToTop}</span>
              <ArrowUp size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
