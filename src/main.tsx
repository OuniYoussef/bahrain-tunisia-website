import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import '@/styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing root element');
// React owns metadata after startup; static tags serve crawlers before JavaScript runs.
document.querySelectorAll('[data-prerender]').forEach((element) => element.remove());

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
