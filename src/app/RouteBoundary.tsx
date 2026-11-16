import { lazy, Suspense } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router';
import { isLocale, savedLocale } from '@/i18n/config';
const NotFound = lazy(() =>
  import('@/features/misc/NotFoundPage').then((module) => ({ default: module.Component })),
);
const RouteError = lazy(() => import('./RouteError'));
export function LocaleRedirect() {
  const { search, hash } = useLocation();
  return <Navigate replace to={`/${savedLocale()}${search}${hash}`} />;
}
export function LocaleGate() {
  const { lang } = useParams();
  return isLocale(lang) ? (
    <Outlet />
  ) : (
    <Suspense>
      <NotFound />
    </Suspense>
  );
}

export function ErrorBoundary() {
  return (
    <Suspense>
      <RouteError />
    </Suspense>
  );
}
export function RouteSkeleton() {
  return <div className="page-skeleton" />;
}
