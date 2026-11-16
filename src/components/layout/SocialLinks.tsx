import { useContent } from '@/i18n/content';
import { socials, hasSocialLinks } from './socials';
export function SocialLinks() {
  const { footer } = useContent('common');
  if (!hasSocialLinks) return null;
  return (
    <nav className="social-links" aria-label={footer.social.label}>
      {(Object.keys(socials) as (keyof typeof socials)[])
        .filter((key) => socials[key])
        .map((key) => (
          <a key={key} href={socials[key]}>
            {footer.social[key]}
          </a>
        ))}
    </nav>
  );
}
