import { Sheet } from '@/components/ui/Dialog';
import { Flag } from '@/components/media/Flag';
import { useContent } from '@/i18n/content';
import { MainNav } from './MainNav';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SocialLinks } from './SocialLinks';
export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { a11y } = useContent('common');
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={a11y.mainNav}
      className="mobile-nav-sheet"
      slideFrom="end"
    >
      <MainNav mobile onNavigate={() => onOpenChange(false)} />
      <LanguageSwitcher full onNavigate={() => onOpenChange(false)} />
      <SocialLinks />
      <div className="mobile-flags" dir="ltr">
        <Flag country="tunisia" />
        <Flag country="bahrain" />
      </div>
    </Sheet>
  );
}
