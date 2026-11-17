import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { useContent, useLocale } from '@/i18n/content';
import { Section } from '@/components/ui/Section';
import { Flag } from '@/components/media/Flag';
import { ResponsiveImage } from '@/components/media/ResponsiveImage';
import { media } from '../media';
import { DUR, EASE, gsap, useGSAP } from '@/lib/gsap';
import { UnitedSectionHeader } from '../UnitedSectionHeader';
import { useNearViewport } from '@/components/media/useNearViewport';

const slides = {
  family: 'families',
  hospitality: 'welcome-art',
  sea: 'sea',
  palms: 'palms',
  faith: 'faith',
  dress: 'dress',
  jewellery: 'jewellery',
  sweets: 'dates-sweets',
  crafts: 'crafts',
  music: 'ships-songs',
  heritage: 'civilizations',
  language: 'language',
} as const;
type Item = ReturnType<typeof useContent<'united'>>['connecting']['items'][number];
function ConnectingCard({ item }: { item: Item }) {
  const locale = useLocale();
  const id = item.id as keyof typeof slides;
  const [tunisia, bahrain] = media('united.connecting.items', id).images;
  return (
    <Link className="connecting-card" to={`/${locale}/common-grounds/${slides[id]}`}>
      <div className="connecting-images" dir="ltr">
        <div className="connecting-photo connecting-photo-tn">
          <ResponsiveImage
            id={tunisia!}
            alt=""
            sizes="(min-width: 1536px) 160px, (min-width: 1024px) 18vw, (min-width: 640px) 26vw, 55vw"
          />
        </div>
        <div className="connecting-photo connecting-photo-bh">
          <ResponsiveImage
            id={bahrain!}
            alt=""
            sizes="(min-width: 1536px) 160px, (min-width: 1024px) 18vw, (min-width: 640px) 26vw, 55vw"
          />
        </div>
        <span className="connecting-seam" aria-hidden="true" />
      </div>
      <div className="connecting-copy">
        <h3 id={`connection-${id}`} className="text-h3">
          {item.theme}
          <ArrowUpRight size={20} aria-hidden="true" className="rtl:-scale-x-100" />
        </h3>
        <p>
          <Flag country="tunisia" size="sm" />
          <span>{item.tunisia}</span>
        </p>
        <p>
          <Flag country="bahrain" size="sm" />
          <span>{item.bahrain}</span>
        </p>
      </div>
    </Link>
  );
}
export function Connecting() {
  const { connecting } = useContent('united');
  const { root, near } = useNearViewport<HTMLElement>();
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (!near || !ctx.conditions?.motion) return;
          const cleanups = gsap.utils.toArray<HTMLElement>('.connecting-card', root.current).map((card) => {
            const tween = gsap
              .timeline({ paused: true, defaults: { duration: DUR.fast, ease: EASE.move } })
              .to(card.querySelector('.connecting-photo-tn'), { clipPath: 'inset(0 42% 0 0)' }, 0)
              .to(card.querySelector('.connecting-photo-bh'), { clipPath: 'inset(0 0 0 58%)' }, 0)
              .to(card.querySelector('.connecting-seam'), { x: () => card.clientWidth * 0.08 }, 0);
            const enter = () => {
              tween.play();
            };
            const leave = () => {
              tween.reverse();
            };
            card.addEventListener('pointerenter', enter);
            card.addEventListener('pointerleave', leave);
            card.addEventListener('focus', enter);
            card.addEventListener('blur', leave);
            return () => {
              card.removeEventListener('pointerenter', enter);
              card.removeEventListener('pointerleave', leave);
              card.removeEventListener('focus', enter);
              card.removeEventListener('blur', leave);
            };
          });
          return () => cleanups.forEach((cleanup) => cleanup());
        },
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [near], revertOnUpdate: true },
  );
  return (
    <Section ref={root} id="connecting" tone="sand">
      <div className="ui-container">
        <UnitedSectionHeader
          id="connecting-title"
          eyebrow={connecting.eyebrow}
          title={connecting.title}
          intro={connecting.intro}
        />
        <div className="connecting-grid">
          {connecting.items.map((item) => (
            <ConnectingCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </Section>
  );
}
