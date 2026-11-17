import { NavLink, Route, Routes } from 'react-router';
import { useContent, useLocale } from '@/i18n/content';
import { Moderation } from './Moderation';
import { Queue } from './queue/Queue';
import { Reports } from './reports/Reports';
import { Alerts } from './alerts/Alerts';
import { Newsletter } from './newsletter/Newsletter';
import { useSignOut } from './auth/context';
export function Dashboard() {
  const signOut = useSignOut();
  const c = useContent('admin');
  const locale = useLocale();
  return (
    <div className="admin-layout">
      <aside>
        <nav aria-label={c.meta.title}>
          {(['pending', 'approved', 'rejected', 'reports', 'alerts', 'newsletter'] as const).map((key) => (
            <NavLink end key={key} to={`/${locale}/admin${key === 'pending' ? '' : '/' + key}`}>
              {c.nav[key]}
            </NavLink>
          ))}
        </nav>
        <button onClick={signOut}>{c.nav.signOut}</button>
      </aside>
      <div className="admin-content">
        <h1 tabIndex={-1}>{c.meta.title}</h1>
        <Moderation>
          <Routes>
            <Route index element={<Queue key="pending" status="pending" />} />
            <Route path="approved" element={<Queue key="approved" status="approved" />} />
            <Route path="rejected" element={<Queue key="rejected" status="rejected" />} />
            <Route path="reports" element={<Reports />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="*" element={<p>{c.ui.notFound}</p>} />
          </Routes>
        </Moderation>
      </div>
    </div>
  );
}
