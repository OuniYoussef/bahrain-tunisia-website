import { useContent } from '@/i18n/content';
import { cn } from '@/lib/cn';
import { SvgArtwork } from './SvgArtwork';
import tunisia from '/images/svg/flags/flag-tunisia.svg?raw';
import bahrain from '/images/svg/flags/flag-bahrain.svg?raw';
const flags = { tunisia, bahrain };
export function Flag({
  country,
  size = 'md',
  decorative = false,
  className,
}: {
  country: 'tunisia' | 'bahrain';
  size?: 'sm' | 'md' | 'lg';
  decorative?: boolean;
  className?: string;
}) {
  const { ui } = useContent('common');
  return (
    <SvgArtwork
      source={flags[country]}
      title={decorative ? undefined : ui[country]}
      className={cn('aspect-[3/2] shrink-0', { sm: 'w-4', md: 'w-6', lg: 'w-8' }[size], className)}
    />
  );
}
