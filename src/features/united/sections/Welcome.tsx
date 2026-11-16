import { useContent } from '@/i18n/content';
import { Flag } from '@/components/media/Flag';
import { Section } from '@/components/ui/Section';

export function Welcome() {
  const { hero, glance } = useContent('united');
  const firstSentence = hero.welcome.split(/(?<=[.!?؟])\s+/u)[0];
  return (
    <Section id="welcome">
      <div className="ui-container welcome-layout">
        <div>
          <p className="welcome-pullquote font-display text-h2">{firstSentence}</p>
          <div className="welcome-flags">
            {(['tunisia', 'bahrain'] as const).map((country) => (
              <span key={country}>
                <Flag country={country} decorative />
                {glance.columns[country]}
              </span>
            ))}
          </div>
        </div>
        <p className="welcome-copy text-body-lg">{hero.welcome}</p>
      </div>
    </Section>
  );
}
