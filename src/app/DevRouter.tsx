import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
const router = createBrowserRouter(
  [
    { path: '/', Component: App },
    ...(import.meta.env.DEV
      ? [
          {
            path: '/dev/styleguide',
            HydrateFallback: App,
            lazy: () => import('@/features/dev/Styleguide'),
            loader: async () => {
              const { loadSpecimens } = await import('@/features/dev/content');
              return loadSpecimens();
            },
          },
        ]
      : []),
  ],
  { basename: import.meta.env.BASE_URL },
);
export default function DevRouter() {
  return <RouterProvider router={router} />;
}
