import { useLayoutEffect, useState } from 'react';
import { useLoaderData } from 'react-router';
import { ContentProvider } from '@/i18n/ContentProvider';
import { useContent, type Locale } from '@/i18n/content';
import type { loadSpecimens } from './content';
import { Container } from '@/components/ui/Container';
import { SegmentedControl } from '@/components/ui/Pill';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { ArchFrame } from '@/components/media/ArchFrame';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { TypeSpecimens } from './TypeSpecimens';
import { Tokens } from './Tokens';
import { Controls } from './Controls';
import { FormSpecimens } from './FormSpecimens';
import { MediaSpecimens } from './MediaSpecimens';

function DirectionToggle({
  direction,
  onChange,
}: {
  direction: 'ltr' | 'rtl';
  onChange: (dir: 'ltr' | 'rtl') => void;
}) {
  return (
    <Button variant="ghost" size="sm" onClick={() => onChange(direction === 'ltr' ? 'rtl' : 'ltr')}>
      <bdi lang="en">dir={direction}</bdi>
    </Button>
  );
}
function Introduction() {
  const common = useContent('common');
  const { welcome } = useContent('tunisia');
  return (
    <Container className="grid items-center gap-12 py-16 lg:grid-cols-12 lg:py-24">
      <div className="lg:col-span-7">
        <Eyebrow className="mb-6">{welcome.eyebrow}</Eyebrow>
        <SplitHeading as="h1" className="text-display-xl">
          {common.site.name}
        </SplitHeading>
        <p className="mt-8 max-w-[48ch] text-body-lg text-ink-soft">{common.site.purpose}</p>
      </div>
      <ArchFrame className="lg:col-span-4 lg:col-start-9">
        <ResponsiveImage
          id="tn-dest-el-djem"
          priority
          sizes="(min-width:1024px) 30vw, 90vw"
          className="aspect-[4/5]"
        />
      </ArchFrame>
    </Container>
  );
}
export function Component() {
  const specimens = useLoaderData<typeof loadSpecimens>();
  const [settings, setSettings] = useState<Settings>({ locale: 'en', direction: 'ltr', theme: 'united' });
  return (
    <ContentProvider locale={settings.locale} content={specimens[settings.locale]}>
      <Styleguide specimens={specimens} settings={settings} onSettingsChange={setSettings} />
    </ContentProvider>
  );
}

type Settings = { locale: Locale; direction: 'ltr' | 'rtl'; theme: string };
function Styleguide({
  specimens,
  settings,
  onSettingsChange,
}: {
  specimens: Awaited<ReturnType<typeof loadSpecimens>>;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}) {
  const { locale, direction, theme } = settings;
  const common = useContent('common');
  useLayoutEffect(() => {
    const html = document.documentElement;
    const previous = { lang: html.lang, dir: html.dir, title: document.title };
    html.lang = locale;
    html.dir = direction;
    document.title = common.site.name;
    return () => {
      html.lang = previous.lang;
      html.dir = previous.dir;
      document.title = previous.title;
    };
  }, [locale, direction, common.site.name]);
  return (
    <main data-theme={theme}>
      <Container className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-6">
        <SegmentedControl
          label={common.a11y.languageSwitcher}
          value={locale}
          onValueChange={(next) => {
            onSettingsChange({ ...settings, locale: next, direction: next === 'ar' ? 'rtl' : 'ltr' });
          }}
          options={[
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'Français' },
            { value: 'ar', label: 'العربية' },
          ]}
        />
        <SegmentedControl
          label={common.nav.commonGrounds}
          value={theme}
          onValueChange={(theme) => onSettingsChange({ ...settings, theme })}
          options={[
            { value: 'united', label: common.nav.united },
            { value: 'tunisia', label: common.nav.tunisia },
            { value: 'bahrain', label: common.nav.bahrain },
          ]}
        />
        <DirectionToggle
          direction={direction}
          onChange={(direction) => onSettingsChange({ ...settings, direction })}
        />
      </Container>
      <Introduction />
      <Tokens />
      <TypeSpecimens specimens={specimens} />
      <Controls />
      <FormSpecimens />
      <MediaSpecimens />
    </main>
  );
}
