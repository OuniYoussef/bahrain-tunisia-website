import { useContent } from '@/i18n/content';
export function NewsletterForm() {
  const { newsletter } = useContent('common').footer;
  return (
    <section className="newsletter-panel" aria-labelledby="newsletter-title">
      <div>
        <h2 id="newsletter-title" className="text-h2">
          {newsletter.title}
        </h2>
        <p>{newsletter.text}</p>
      </div>
      <form onSubmit={(event) => event.preventDefault()} aria-describedby="newsletter-status">
        <fieldset disabled>
          <legend className="sr-only">{newsletter.title}</legend>
          <label htmlFor="newsletter-email">{newsletter.emailLabel}</label>
          <div className="newsletter-input-row">
            <input id="newsletter-email" type="email" autoComplete="email" name="email" />
            <button type="submit">{newsletter.button}</button>
          </div>
          <label className="newsletter-consent">
            <input type="checkbox" name="consent" /> <span>{newsletter.consent}</span>
          </label>
        </fieldset>
        <output id="newsletter-status">{newsletter.unavailable}</output>
      </form>
    </section>
  );
}
