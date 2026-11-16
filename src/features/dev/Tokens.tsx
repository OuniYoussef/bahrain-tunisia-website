import { useContent } from '@/i18n/content';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
const colours = [
  'pearl',
  'pearl-glow',
  'sand-50',
  'sand-100',
  'sand-300',
  'line',
  'ink',
  'ink-soft',
  'muted',
  'ieee',
  'ieee-40',
  'crimson',
  'tn-blue',
  'tn-blue-deep',
  'terracotta',
  'olive',
  'bh-teal',
  'bh-teal-deep',
  'gold',
  'gold-deep',
  'palm',
];
const radii = ['sm', 'md', 'lg', 'xl', 'arch'];
const fonts = ['display', 'sans', 'kufi', 'ieee'];
export function Tokens() {
  const { welcome } = useContent('tunisia');
  const common = useContent('common');
  return (
    <Section id="tokens" tone="sand" aria-labelledby="tokens-heading">
      <Container>
        <SectionHeader id="tokens-heading" title={welcome.factsTitle} />
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-7">
          {colours.map((name) => (
            <div key={name} className="min-w-0">
              <div
                className="mb-3 h-20 rounded-md border border-line"
                style={{ backgroundColor: `var(--color-${name})` }}
              />
              <span lang="en" dir="ltr" className="text-small text-ink">
                {name}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-6">
          {radii.map((radius) => (
            <div
              key={radius}
              lang="en"
              dir="ltr"
              className="flex h-24 w-24 items-center justify-center border border-muted bg-pearl text-small"
              style={{ borderRadius: `var(--radius-${radius})` }}
            >
              {radius}
            </div>
          ))}
          {['soft', 'lift'].map((shadow) => (
            <div
              key={shadow}
              lang="en"
              dir="ltr"
              className="flex h-24 w-24 items-center justify-center rounded-md bg-pearl text-small"
              style={{ boxShadow: `var(--shadow-${shadow})` }}
            >
              {shadow}
            </div>
          ))}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {fonts.map((font) => (
            <div key={font}>
              <span lang="en" dir="ltr" className="text-small text-muted">
                {font}
              </span>
              <p className="text-h3" style={{ fontFamily: `var(--font-${font})` }}>
                {common.site.name}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
