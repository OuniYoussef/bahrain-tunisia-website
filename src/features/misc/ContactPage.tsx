import { Mail } from 'lucide-react';
import { useContent } from '@/i18n/content';
import { env } from '@/lib/env';
import { PageHead } from '@/components/layout/PageHead';
import { SocialLinks } from '@/components/layout/SocialLinks';
import { hasSocialLinks } from '@/components/layout/socials';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
export function Component() {
  const { contact } = useContent('common');
  return (
    <section className="ui-container simple-page contact-page">
      <PageHead title={contact.metaTitle} description={contact.metaDescription} page="contact" />
      <div className="contact-copy">
        <Eyebrow>{contact.eyebrow}</Eyebrow>
        <h1 className="text-display-lg" tabIndex={-1}>
          {contact.title}
        </h1>
        <p className="text-body-lg">{contact.text}</p>
        {env.VITE_CONTACT_EMAIL ? (
          <>
            <ButtonLink href={`mailto:${env.VITE_CONTACT_EMAIL}`} icon={<Mail size={20} />} size="lg">
              {contact.emailLabel}
            </ButtonLink>
            <p className="text-muted">{contact.responseNote}</p>
          </>
        ) : (
          <p>{contact.unavailable}</p>
        )}
        {hasSocialLinks && (
          <>
            <h2 className="text-h3">{contact.socialTitle}</h2>
            <SocialLinks />
          </>
        )}
      </div>
      <div className="contact-images" dir="ltr">
        <ResponsiveImage id="tn-sbs-blue-door" alt="" priority sizes="(min-width:1024px) 22vw, 44vw" />
        <ResponsiveImage id="bh-craft-rawazin" alt="" sizes="(min-width:1024px) 22vw, 44vw" />
      </div>
    </section>
  );
}
