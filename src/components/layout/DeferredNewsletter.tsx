import { lazy, Suspense } from 'react';
import { useNearViewport } from '@/components/media/useNearViewport';
import { useContent } from '@/i18n/content';
const NewsletterForm = lazy(() => import('./NewsletterForm').then((m) => ({ default: m.NewsletterForm })));
export function DeferredNewsletter() {
  const { root, near } = useNearViewport<HTMLDivElement>(true, '600px');
  const { newsletter } = useContent('common').footer;
  const fallback = (
    <section className="newsletter-panel" aria-busy="true">
      <div>
        <h2 className="text-h2">{newsletter.title}</h2>
        <p>{newsletter.text}</p>
      </div>
    </section>
  );
  return (
    <div ref={root} className="newsletter-slot">
      <Suspense fallback={fallback}>{near ? <NewsletterForm /> : fallback}</Suspense>
    </div>
  );
}
