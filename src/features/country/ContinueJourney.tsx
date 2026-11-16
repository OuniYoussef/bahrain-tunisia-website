import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { useContent, useLocale } from '@/i18n/content';
import type { Country } from './country.config';

export function ContinueJourney({ country }: { country: Country }) {
  const { nav, ui } = useContent('common');
  const locale = useLocale();
  const other = country === 'tunisia' ? 'bahrain' : 'tunisia';
  return (
    <nav className="country-continue ui-container" aria-labelledby="continue-title">
      <h2 id="continue-title" className="text-h3">
        {ui.continueJourney}
      </h2>
      <div>
        <Link to={`/${locale}/${other}`}>
          <span>{nav[other]}</span>
          <ArrowUpRight aria-hidden="true" className="rtl:-scale-x-100" />
        </Link>
        <Link to={`/${locale}/common-grounds`}>
          <span>{nav.commonGrounds}</span>
          <ArrowUpRight aria-hidden="true" className="rtl:-scale-x-100" />
        </Link>
      </div>
    </nav>
  );
}
