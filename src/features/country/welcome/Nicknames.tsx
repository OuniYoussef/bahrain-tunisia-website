import type { Content } from '@/i18n/content';

export function Nicknames({ content }: { content: Content['bahrain']['welcome'] }) {
  return (
    <section className="country-nicknames" aria-labelledby="nicknames-title">
      <h2 id="nicknames-title" className="text-h3">
        {content.nicknamesTitle}
      </h2>
      <div className="nickname-labels">
        {content.nicknames.map((item) => (
          <article key={item.id} data-item-id={item.id}>
            <h3 className="text-h4">{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
      <div className="two-waters">
        <svg viewBox="0 0 240 160" aria-hidden="true" focusable="false">
          <path className="sweet-water" d="M60 12C48 38 20 62 20 88a40 40 0 0 0 80 0C100 62 72 38 60 12Z" />
          <path
            className="salt-water"
            d="M112 40q24-20 48 0t48 0M112 64q24-20 48 0t48 0M112 88q24-20 48 0t48 0M112 112q24-20 48 0t48 0"
          />
          <path className="water-seam" d="M20 145h188" />
        </svg>
        <blockquote>{content.nameOrigin}</blockquote>
      </div>
    </section>
  );
}
