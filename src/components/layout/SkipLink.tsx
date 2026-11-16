import { useContent } from '@/i18n/content';
export function SkipLink() {
  const { a11y } = useContent('common');
  return (
    <a className="skip-link" href="#main" onClick={() => document.getElementById('main')?.focus()}>
      {a11y.skipToContent}
    </a>
  );
}
