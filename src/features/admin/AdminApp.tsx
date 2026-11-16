import { useContent } from '@/i18n/content';
import { PageHead } from '@/components/layout/PageHead';
export function Component() {
  const { login, meta } = useContent('admin');
  return (
    <section className="ui-container simple-page">
      <PageHead title={meta.title} page="admin" noindex />
      <h1 className="text-display-lg" tabIndex={-1}>
        {login.title}
      </h1>
    </section>
  );
}
