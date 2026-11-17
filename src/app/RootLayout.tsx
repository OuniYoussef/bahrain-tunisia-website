import { Suspense, type ReactNode } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { useContent } from '@/i18n/content';
import { MetaNav } from '@/components/layout/MetaNav';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SkipLink } from '@/components/layout/SkipLink';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { AlertBanner } from '@/components/layout/AlertBanner';
import { CookieConsentSlot } from '@/components/layout/CookieConsentSlot';
import { PageTransition } from '@/components/layout/PageTransition';
import { NavigationEffects } from './navigation';
function Shell({ children }: { children?: ReactNode }) {
  const { a11y } = useContent('common');
  const location = useLocation();
  const section = location.pathname.split('/')[2];
  const hero = !children && (!section || ['tunisia', 'bahrain', 'common-grounds'].includes(section));
  return (
    <>
      <SkipLink />
      <MetaNav />
      <SiteHeader hero={hero} />
      <AlertBanner />
      <main id="main" tabIndex={-1}>
        <PageTransition>
          <Suspense
            fallback={<div className="page-skeleton" aria-label={a11y.loadingPage} aria-busy="true" />}
          >
            {children ?? <Outlet />}
            <NavigationEffects />
          </Suspense>
        </PageTransition>
      </main>
      <SiteFooter />
      <CookieConsentSlot />
      <ScrollRestoration />
    </>
  );
}
export function RootLayout({ children }: { children?: ReactNode }) {
  return (
    <LocaleProvider>
      <Suspense fallback={<div className="page-skeleton" />}>
        <Shell>{children}</Shell>
      </Suspense>
    </LocaleProvider>
  );
}
export const Component = RootLayout;
