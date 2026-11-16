import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useContent } from '@/i18n/content';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Dialog, DialogClose, Sheet } from '@/components/ui/Dialog';
import { Tabs, Tab, TabList, TabPanel } from '@/components/ui/Tabs';
import { Pill, SegmentedControl } from '@/components/ui/Pill';
import { Badge, UnescoBadge } from '@/components/ui/Badge';
import { LiveRegion } from '@/components/ui/LiveRegion';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';

export function Controls() {
  const common = useContent('common');
  const { welcome, destinations } = useContent('tunisia');
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [tab, setTab] = useState('tunisia');
  const [segment, setSegment] = useState('tunisia');
  const [selected, setSelected] = useState(false);
  return (
    <>
      <Section id="controls" tone="ink" aria-labelledby="controls-heading">
        <Container>
          <SectionHeader id="controls-heading" title={common.nav.commonGrounds} intro={common.site.purpose} />
          <div className="flex flex-wrap items-center gap-4">
            {(['primary', 'accent', 'ghost', 'link'] as const).map((variant) => (
              <Button
                key={variant}
                variant={variant}
                icon={<ArrowRight size={18} />}
                iconDirection="reading"
                onClick={() => setDialog(true)}
              >
                {common.ui.readMore}
              </Button>
            ))}
            <Button disabled>{common.ui.loading}</Button>
            <ButtonLink href="#media" variant="ghost" icon={<ArrowRight size={18} />} iconDirection="reading">
              {common.ui.seeAll}
            </ButtonLink>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Badge>{common.ui.both}</Badge>
            <UnescoBadge />
            <UnescoBadge year={1979} />
            <Spinner />
          </div>
        </Container>
      </Section>
      <Section tone="pearl" aria-labelledby="interaction-heading">
        <Container>
          <SectionHeader id="interaction-heading" title={common.footer.columns.explore.title} />
          <div className="mb-8 flex flex-wrap items-center gap-4">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <Button key={size} size={size} onClick={() => setSheet(true)}>
                {common.ui.showMore}
              </Button>
            ))}
            <Pill aria-pressed={selected} onClick={() => setSelected(!selected)}>
              {common.ui.both}
            </Pill>
          </div>
          <SegmentedControl
            label={common.nav.commonGrounds}
            value={segment}
            onValueChange={setSegment}
            options={[
              { value: 'tunisia', label: common.ui.tunisia },
              { value: 'bahrain', label: common.ui.bahrain },
            ]}
          />
          <div className="mt-8">
            <Tabs value={tab} onValueChange={setTab}>
              <TabList aria-label={common.nav.commonGrounds}>
                <Tab value="tunisia">{common.ui.tunisia}</Tab>
                <Tab value="bahrain">{common.ui.bahrain}</Tab>
                <Tab value="both">{common.ui.both}</Tab>
              </TabList>
              <TabPanel value="tunisia">
                <p>{welcome.subheadline}</p>
              </TabPanel>
              <TabPanel value="bahrain">
                <p>{common.site.purpose}</p>
              </TabPanel>
              <TabPanel value="both">
                <p>{common.site.defaultDescription}</p>
              </TabPanel>
            </Tabs>
          </div>
          <div className="mt-8 space-y-3" aria-busy="true">
            <Skeleton className="h-10 max-w-md" />
            <Skeleton className="max-w-sm" />
          </div>
          <LiveRegion>{selected ? common.ui.both : ''}</LiveRegion>
          <Dialog
            open={dialog}
            onOpenChange={setDialog}
            title={destinations.title}
            description={destinations.intro}
          >
            <p className="mb-6">{welcome.subheadline}</p>
            <DialogClose>{common.ui.close}</DialogClose>
          </Dialog>
          <Sheet
            open={sheet}
            onOpenChange={setSheet}
            title={common.contact.title}
            description={common.contact.text}
          >
            <p className="mb-6">{common.contact.responseNote}</p>
            <DialogClose>{common.ui.close}</DialogClose>
          </Sheet>
        </Container>
      </Section>
    </>
  );
}
