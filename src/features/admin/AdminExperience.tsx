import { lazy, Suspense, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useContent } from '@/i18n/content';
import { AuthGate } from './auth/AuthGate';
const Dashboard = lazy(() => import('./Dashboard').then((module) => ({ default: module.Dashboard })));
export default function AdminExperience() {
  const { ui } = useContent('admin');
  const [cache] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 }, mutations: { retry: false } },
      }),
  );
  return (
    <QueryClientProvider client={cache}>
      <AuthGate>
        <Suspense fallback={<output>{ui.loading}</output>}>
          <Dashboard />
        </Suspense>
      </AuthGate>
    </QueryClientProvider>
  );
}
