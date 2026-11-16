import { useContent } from '@/i18n/content';
export function SkipLink() {
  const { a11y } = useContent('common');
  return (
    <a
      className="skip-link"
      href="#main"
      onClick={(event) => {
        const main = document.getElementById('main');
        if (!main) return;
        event.preventDefault();
        main.focus({ preventScroll: true });
        main.scrollIntoView({ block: 'start', behavior: 'instant' });
      }}
    >
      {a11y.skipToContent}
    </a>
  );
}
