import { useContent, useLocale } from '@/i18n/content';
import { Link } from 'react-router';
import { PageHead } from '@/components/layout/PageHead';
import { RootLayout } from './RootLayout';
function ErrorContent() {
  const { error, nav } = useContent('common');
  const locale = useLocale();
  return (
    <section className="ui-container simple-page">
      <PageHead title={error.title} noindex />
      <h1 className="text-display-lg" tabIndex={-1}>
        {error.title}
      </h1>
      <p>{error.text}</p>
      <button
        type="button"
        className="ui-button ui-button-primary ui-button-md"
        onClick={() => window.location.reload()}
      >
        {error.reload}
      </button>
      <Link className="inline-flex min-h-11 items-center px-4" to={`/${locale}/contact`}>
        {nav.contact}
      </Link>
    </section>
  );
}
export default function RouteError() {
  return (
    <RootLayout>
      <ErrorContent />
    </RootLayout>
  );
}
