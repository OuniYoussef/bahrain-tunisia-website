import { useContent } from '@/i18n/content';
import { schema, type empty } from './schema';
export function Preview({ draft }: { draft: typeof empty }) {
  const c = useContent('admin');
  return (
    <fieldset>
      <legend>{c.ui.preview}</legend>
      {(['en', 'fr', 'ar'] as const).map((lang) => (
        <div
          className={`admin-preview admin-preview-${draft.level}`}
          key={lang}
          lang={lang}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <strong>{c.languages[lang]}</strong>
          <p>{draft[`message_${lang}`]}</p>
          {schema.shape.link_url.safeParse(draft.link_url).success && draft.link_url && (
            <a href={draft.link_url} target="_blank" rel="noopener noreferrer">
              {draft.link_url}
            </a>
          )}
        </div>
      ))}
    </fieldset>
  );
}
