import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { Flip } from '@/lib/gsap-flip';
import { DUR, EASE, STAGGER, gsap, useGSAP } from '@/lib/gsap';
import { useContent, useLocale } from '@/i18n/content';
import { plural } from '@/i18n/format';
import { useStories } from './hooks';
import { PendingStories } from './PendingStories';
import { StoryCard } from './StoryCard';
import { Ornament } from '@/components/media/Ornament';
import type { Country, Category } from './api/types';
export function StoryWall() {
  const { wall, hero } = useContent('vault');
  const locale = useLocale();
  const [params, setParams] = useSearchParams();
  const root = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const state = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const previous = useRef(new Set<string>());
  const country = params.get('country') ?? 'all';
  const category = params.get('category') ?? 'all';
  const query = useStories({
    country: ['tunisia', 'bahrain', 'both'].includes(country) ? (country as Country) : undefined,
    category: ['story', 'photo', 'diary', 'anecdote'].includes(category) ? (category as Category) : undefined,
  });
  const { hasNextPage, isFetching, isError, fetchNextPage } = query;
  const stories = query.data?.pages.flatMap((p) => p.items) ?? [];
  const identity = stories.map((story) => story.id).join(',');
  useGSAP(
    () => {
      if (query.isPlaceholderData || !root.current?.querySelector('.story-card')) return;
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (!ctx.conditions?.motion) return;
          if (state.current)
            Flip.from(state.current, {
              targets: root.current?.querySelectorAll('.story-card'),
              scale: true,
              duration: DUR.base,
              ease: EASE.move,
              onEnter: (elements) =>
                gsap.fromTo(
                  elements,
                  { opacity: 0, scale: 0.95 },
                  { opacity: 1, scale: 1, duration: DUR.fast },
                ),
            });
          else {
            const entering = Array.from(
              root.current?.querySelectorAll<HTMLElement>('.story-card') ?? [],
            ).filter((node) => !previous.current.has(node.dataset.flipId ?? ''));
            if (entering.length)
              gsap.from(entering, { opacity: 0, y: 16, stagger: STAGGER, duration: DUR.base });
          }
        },
      );
      state.current = null;
      previous.current = new Set(identity.split(','));
      return () => mm.revert();
    },
    { scope: root, dependencies: [identity, query.isPlaceholderData], revertOnUpdate: true },
  );
  useEffect(() => {
    const element = sentinel.current;
    if (!element || !hasNextPage || isFetching || isError) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void fetchNextPage();
      },
      { rootMargin: '200px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasNextPage, isFetching, isError, fetchNextPage]);
  function change(key: string, value: string) {
    const cards = root.current?.querySelectorAll('.story-card');
    state.current =
      cards?.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? Flip.getState(cards)
        : null;
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { preventScrollReset: true });
  }
  return (
    <section className="vault-wall ui-container" ref={root}>
      <h2 className="text-h2">{wall.title}</h2>
      <div className="vault-filters" aria-label={wall.filtersLabel}>
        {(['country', 'category'] as const).map((key) => (
          <fieldset key={key}>
            <legend>{key === 'country' ? wall.countryLabel : wall.categoryLabel}</legend>
            <div>
              {Object.entries(wall[key]).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={(key === 'country' ? country : category) === value}
                  onClick={() => change(key, value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <p aria-live="polite">
        {query.data?.pages[0]?.total !== undefined
          ? plural(wall.resultsCount, query.data.pages[0].total, locale)
          : ''}
      </p>
      {query.isPending ? (
        <div className="vault-grid" aria-label={wall.loading}>
          {[0, 1, 2, 3].map((i) => (
            <div className="vault-skeleton" key={i} />
          ))}
        </div>
      ) : (
        <div className="vault-grid" aria-busy={query.isFetching}>
          {stories.map((story) => (
            <StoryCard story={story} key={story.id} />
          ))}
        </div>
      )}
      {query.isError && (
        <div aria-live="polite">
          <p>{wall.error}</p>
          <button onClick={() => void query.refetch()}>{wall.retry}</button>
        </div>
      )}
      {!query.isPending && !query.isError && !stories.length && (
        <div className="vault-empty">
          <Ornament kind="jasmine" className="mx-auto" />
          <p>{country === 'all' && category === 'all' ? wall.empty : wall.emptyFiltered}</p>
          <button
            onClick={() => {
              const next = new URLSearchParams(params);
              next.delete('country');
              next.delete('category');
              setParams(next, { preventScrollReset: true });
            }}
          >
            {wall.clearFilters}
          </button>
          <button onClick={() => change('share', '1')}>{hero.ctaShare}</button>
        </div>
      )}
      <PendingStories />
      <div ref={sentinel} />
      {query.hasNextPage ? (
        <button disabled={query.isFetching} onClick={() => void query.fetchNextPage()}>
          {query.isFetching ? wall.loading : wall.loadMore}
        </button>
      ) : (
        stories.length > 0 && <p className="vault-end">{wall.end}</p>
      )}
    </section>
  );
}
