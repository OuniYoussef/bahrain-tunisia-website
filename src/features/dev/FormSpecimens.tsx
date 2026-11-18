import { useState } from 'react';
import { useContent } from '@/i18n/content';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { RadioCards } from '@/components/ui/RadioCards';
import { Button } from '@/components/ui/Button';
import { Pattern } from '@/components/media/Pattern';
import { Ornament } from '@/components/media/Ornament';
export function FormSpecimens() {
  const common = useContent('common');
  const newsletter = common.footer.newsletter;
  const [country, setCountry] = useState('tunisia');
  const [text, setText] = useState('');
  return (
    <Section id="forms" tone="sand" aria-labelledby="forms-heading">
      <Container>
        <SectionHeader
          id="forms-heading"
          eyebrow={common.contact.eyebrow}
          title={common.contact.title}
          intro={common.contact.text}
        />
        <div className="grid gap-12 lg:grid-cols-12">
          <form className="grid min-w-0 gap-6 lg:col-span-7" onSubmit={(event) => event.preventDefault()}>
            <Input
              type="email"
              spellCheck={false}
              label={newsletter.emailLabel}
              autoComplete="email"
              name="email"
              error={newsletter.invalid}
              hint={newsletter.text}
            />
            <Textarea
              name="message"
              autoComplete="off"
              label={common.contact.title}
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={240}
              hint={common.contact.responseNote}
            />
            <Select name="country" label={common.nav.commonGrounds} defaultValue="tunisia">
              <option value="tunisia">{common.ui.tunisia}</option>
              <option value="bahrain">{common.ui.bahrain}</option>
            </Select>
            <RadioCards
              label={common.footer.columns.explore.title}
              value={country}
              onValueChange={setCountry}
              options={[
                { value: 'tunisia', label: common.ui.tunisia },
                { value: 'bahrain', label: common.ui.bahrain },
              ]}
            />
            <Checkbox label={newsletter.consent} name="consent" />
            <Button type="submit" className="justify-self-start">
              {newsletter.button}
            </Button>
          </form>
          <aside
            className="relative flex min-h-48 items-center justify-center overflow-hidden rounded-arch bg-sand-100 text-gold-deep lg:col-span-4 lg:col-start-9"
            aria-hidden="true"
          >
            <Pattern kind="mashrabiya" className="absolute inset-0 h-full" />
            <Ornament kind="jasmine" className="size-40" />
          </aside>
        </div>
      </Container>
    </Section>
  );
}
