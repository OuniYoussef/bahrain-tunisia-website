import { createBrowserRouter, type LoaderFunctionArgs } from 'react-router';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { loadNamespace } from '@/i18n/content';
import { loadCountryOverview, type CountryNamespace } from '@/i18n/countryOverview';
import { env } from '@/lib/env';
import type { Content } from '@/content/types';
import { LocaleRedirect, LocaleGate, ErrorBoundary, RouteSkeleton } from './RouteBoundary';
const preload =
  (...namespaces: (keyof Content)[]) =>
  async ({ params }: LoaderFunctionArgs) => {
    const locale = isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    await Promise.all(
      [...namespaces, ...(!isLocale(params.lang) ? ['images' as const] : [])].map((ns) =>
        loadNamespace(locale, ns),
      ),
    );
    return null;
  };
const preloadCountry =
  (country: CountryNamespace) =>
  async ({ params }: LoaderFunctionArgs) => {
    await loadCountryOverview(isLocale(params.lang) ? params.lang : DEFAULT_LOCALE, country);
    return null;
  };
export const router = createBrowserRouter(
  [
    { path: '/', Component: LocaleRedirect },
    ...(import.meta.env.DEV
      ? [
          {
            path: '/dev/styleguide',
            lazy: () => import('@/features/dev/Styleguide'),
            loader: async () => (await import('@/features/dev/content')).loadSpecimens(),
            HydrateFallback: RouteSkeleton,
          },
        ]
      : []),
    {
      path: '/:lang',
      lazy: () => import('./RootLayout'),
      loader: preload('common'),
      HydrateFallback: RouteSkeleton,
      ErrorBoundary,
      children: [
        {
          Component: LocaleGate,
          children: [
            {
              index: true,
              lazy: () => import('@/features/united/UnitedPage'),
              loader: preload('united'),
            },
            {
              path: 'tunisia',
              lazy: () => import('@/features/country/CountryPage'),
              loader: preloadCountry('tunisia'),
            },
            {
              path: 'bahrain',
              lazy: () => import('@/features/country/CountryPage'),
              loader: preloadCountry('bahrain'),
            },
            {
              path: 'common-grounds/:slideId?',
              lazy: () => import('@/features/common-grounds/CommonGroundsPage'),
            },
            {
              path: 'vault',
              lazy: () => import('@/features/vault/VaultPage'),
              loader: preload('vault'),
            },
            { path: 'contact', lazy: () => import('@/features/misc/ContactPage'), loader: preload('images') },
            { path: 'credits', lazy: () => import('@/features/misc/CreditsPage'), loader: preload('images') },
            {
              path: 'admin/*',
              lazy: () => import('@/features/admin/AdminApp'),
              loader: preload('admin'),
            },
            { path: '*', lazy: () => import('@/features/misc/NotFoundPage'), loader: preload('images') },
          ],
        },
      ],
    },
    {
      path: '*',
      lazy: () => import('@/features/misc/NotFoundLayout'),
      loader: preload('common', 'images'),
      HydrateFallback: RouteSkeleton,
      ErrorBoundary,
    },
  ],
  { basename: env.basePath },
);
