import { Flag } from '@/components/media/Flag';
import type { Country } from '../country.config';
export function FactList({
  country,
  title,
  facts,
}: {
  country: Country;
  title: string;
  facts: { id: string; label: string; value: string }[];
}) {
  return (
    <section aria-labelledby="facts-title">
      <h2 id="facts-title" className="text-h3">
        {title}
      </h2>
      <dl className="country-facts">
        {facts.map((fact) => (
          <div key={fact.id} data-fact={fact.id}>
            <dt>{fact.label}</dt>
            <dd>
              {fact.id === 'flag' && <Flag country={country} decorative />}
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
