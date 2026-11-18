import { useLocale } from '@/i18n/content';
import type { CountryContent } from '../types';
export function WordTable({ content }: { content: CountryContent['welcome'] }) {
  const rtl = useLocale() === 'ar';
  return (
    <section aria-labelledby="words-title">
      <h2 id="words-title" className="text-h3">
        {content.wordsTitle}
      </h2>
      <p id="words-intro" className="mt-4 mb-6 text-small text-muted">
        {content.wordsIntro}
      </p>
      {/* Keyboard users must be able to scroll the complete table at narrow widths. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <section className="country-words-scroll" tabIndex={0} aria-labelledby="words-intro">
        <table className="country-words">
          <caption className="sr-only">{content.wordsTitle}</caption>
          <thead>
            <tr>
              {rtl && <th scope="col">{content.wordsColumns.script}</th>}
              <th scope="col">{content.wordsColumns.meaning}</th>
              <th scope="col">{content.wordsColumns.local}</th>
              {!rtl && <th scope="col">{content.wordsColumns.script}</th>}
            </tr>
          </thead>
          <tbody>
            {content.words.map((word) => (
              <tr key={word.id}>
                {rtl && (
                  <td lang="ar" dir="rtl">
                    {word.script}
                  </td>
                )}
                <th scope="row">{word.meaning}</th>
                <td dir={rtl ? 'rtl' : 'ltr'} className="word-transliteration">
                  {word.say}
                </td>
                {!rtl && (
                  <td lang="ar" dir="rtl">
                    {word.script}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}
