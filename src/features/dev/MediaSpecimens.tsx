import { useContent } from '@/i18n/content';
import { media } from '@/lib/media';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { UnescoBadge } from '@/components/ui/Badge';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { ArchFrame } from '@/components/media/ArchFrame';
import { Flag } from '@/components/media/Flag';
import { Pattern } from '@/components/media/Pattern';
import { Ornament } from '@/components/media/Ornament';
import { InlineSvg } from '@/components/media/InlineSvg';
import { Reveal } from '@/components/motion/Reveal';
import { Parallax } from '@/components/motion/Parallax';
export function MediaSpecimens() {
  const { destinations } = useContent('tunisia');
  const common = useContent('common');
  const destination = destinations.featured.find((item) => item.id === 'el-djem')!;
  const image = media('tunisia.destinations.featured', 'el-djem').image;
  return (
    <Section id="media" aria-labelledby="media-heading">
      <Container>
        <SectionHeader
          id="media-heading"
          eyebrow={destinations.eyebrow}
          title={destinations.title}
          intro={destinations.intro}
        />
        <div className="grid items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Reveal>
            <Card>
              <ArchFrame>
                <Parallax>
                  <ResponsiveImage
                    id={image}
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                    className="aspect-[4/5]"
                  />
                </Parallax>
              </ArchFrame>
              <div className="space-y-4 p-6">
                <Flag country="tunisia" />
                <h3 className="text-h4">{destination.title}</h3>
                <p className="line-clamp-3 text-small text-ink-soft">{destination.text}</p>
                <UnescoBadge />
              </div>
            </Card>
          </Reveal>
          <div>
            <ArchFrame shape="horseshoe">
              <ResponsiveImage id={image} className="aspect-[4/5]" sizes="(min-width: 768px) 35vw, 90vw" />
            </ArchFrame>
            <p className="mt-4 text-small text-muted">{destination.title}</p>
          </div>
          <Card>
            <ResponsiveImage id="bh-wear-thobe" className="aspect-[4/5]" />
            <div className="space-y-3 p-6">
              <Flag country="bahrain" />
              <h3 className="text-h4">{common.ui.bahrain}</h3>
            </div>
          </Card>
        </div>
        <div className="mt-10">
          <ResponsiveImage id={image} credit sizes="80vw" className="aspect-[16/7]" />
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <div>
            <Pattern kind="khatam" />
            <Pattern kind="mashrabiya" />
          </div>
          <div className="flex flex-wrap items-center gap-8 text-gold-deep">
            <Ornament kind="jasmine" />
            <Ornament kind="razji" />
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <span key={size} className="inline-flex gap-2">
                <Flag country="tunisia" size={size} />
                <Flag country="bahrain" size={size} />
              </span>
            ))}
          </div>
        </div>
        <div data-theme="bahrain" className="mt-10 space-y-4">
          <Pattern kind="serrated" className="text-(--accent)" />
          <Pattern kind="sadu" />
        </div>
        <InlineSvg asset="skyline" title={common.footer.skyline.label} className="mt-12 w-full text-ink" />
      </Container>
    </Section>
  );
}
