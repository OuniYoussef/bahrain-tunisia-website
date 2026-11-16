import { ContentProvider } from '@/i18n/ContentProvider';
import { useContent, type Content, type Locale } from '@/i18n/content';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { cn } from '@/lib/cn';

const scale = [
  ['display-xl', 'text-display-xl font-display'],
  ['display-lg', 'text-display-lg font-display'],
  ['h2', 'text-h2 font-display'],
  ['h3', 'text-h3 font-display'],
  ['h4', 'text-h4 font-display'],
  ['body-lg', 'text-body-lg'],
  ['body', 'text-body'],
  ['small', 'text-small'],
  ['eyebrow', 'text-eyebrow'],
] as const;

function Specimen() {
  const { welcome } = useContent('tunisia');
  return (
    <div className="min-w-0 space-y-8">
      {scale.map(([name, className]) => (
        <div key={name} className="border-t border-line pt-4">
          <span lang="en" dir="ltr" className="mb-3 block text-small text-muted">
            {name}
          </span>
          <p className={cn('break-words', className)}>
            {name.startsWith('display') || name.startsWith('h')
              ? welcome.headline
              : name === 'eyebrow'
                ? welcome.eyebrow
                : welcome.subheadline}
          </p>
        </div>
      ))}
    </div>
  );
}
export function TypeSpecimens({
  specimens,
}: {
  specimens: Record<Locale, Pick<Content, 'common' | 'tunisia' | 'images'>>;
}) {
  const { welcome } = useContent('tunisia');
  return (
    <Section id="type" aria-labelledby="type-heading">
      <Container>
        <SectionHeader id="type-heading" title={welcome.wordsTitle} intro={welcome.wordsIntro} />
        <div className="space-y-14">
          {(['en', 'fr', 'ar'] as const).map((locale) => (
            <div key={locale} lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <ContentProvider locale={locale} content={specimens[locale]}>
                <Specimen />
              </ContentProvider>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
