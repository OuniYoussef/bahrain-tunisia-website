import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Eyebrow } from './Eyebrow';
type Props = {
  id: string;
  index?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  className?: string;
};
export function SectionHeader({ id, index, eyebrow, title, intro, className }: Props) {
  return (
    <header className={cn('mb-10 grid gap-6 text-start lg:grid-cols-12 lg:gap-8', className)}>
      <div className="lg:col-span-5">
        {index && (
          <span className="mb-4 block font-kufi text-h3 tabular-nums" aria-hidden="true">
            {index}
          </span>
        )}
        {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
        <h2 id={id} className="text-h2">
          {title}
        </h2>
      </div>
      {intro && (
        <div className="max-w-[62ch] self-end text-body-lg text-(--secondary-text) lg:col-span-6 lg:col-start-7">
          {intro}
        </div>
      )}
    </header>
  );
}
