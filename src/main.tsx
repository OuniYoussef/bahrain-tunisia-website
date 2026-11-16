import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import '@/styles/index.css';

const Entry = import.meta.env.DEV ? lazy(() => import('@/app/DevRouter')) : App;

const root = document.getElementById('root');
if (!root) throw new Error('Missing root element');

createRoot(root).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Entry />
    </Suspense>
  </StrictMode>,
);
