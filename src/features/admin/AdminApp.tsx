import { useContent } from '@/i18n/content';
import { PageHead } from '@/components/layout/PageHead';
import { lazy, Suspense } from 'react';
import { env } from '@/lib/env';
import './admin.css';
const AdminExperience = lazy(() => import('./AdminExperience'));
export function Component() {
  const { login, meta, ui } = useContent('admin');
  return (
    <section className="ui-container simple-page">
      <PageHead title={meta.title} page="admin" noindex />
      {env.vaultMode === 'supabase' ? (
        <Suspense fallback={<output>{ui.loading}</output>}>
          <AdminExperience />
        </Suspense>
      ) : (
        <div className="admin-auth">
          <h1 tabIndex={-1}>{login.title}</h1>
          <output>{ui.requiresSupabase}</output>
        </div>
      )}
    </section>
  );
}
