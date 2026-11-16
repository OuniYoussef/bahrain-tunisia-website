import { Suspense } from 'react';
import { MemoryRouter } from 'react-router';
import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { ContentProvider } from '@/i18n/ContentProvider';
import { loadNamespace, type Locale } from '@/i18n/content';
import { ImageCatalogContext } from '@/components/media/ImageCatalog';
import sourceMedia from '@/content/media.json';
import { CountryPage } from './CountryPage';

// jsdom cannot measure layout; real scrolling, focus and media changes are checked in Playwright.
beforeAll(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      callback: IntersectionObserverCallback;
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }
      observe(target: Element) {
        this.callback(
          [{ isIntersecting: true, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      }
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.scrollBy = vi.fn();
});
afterAll(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document, 'fonts');
});

describe.each(['en', 'fr', 'ar'] as const)('Tunisia in %s', (locale: Locale) => {
  it('renders every source item once, including hidden groups and the expanded timeline', async () => {
    const [tunisia, common, images] = await Promise.all([
      loadNamespace(locale, 'tunisia'),
      loadNamespace(locale, 'common'),
      loadNamespace(locale, 'images'),
    ]);
    const { container } = render(
      <ContentProvider locale={locale} content={{ tunisia, common, images }}>
        <ImageCatalogContext value={{}}>
          <MemoryRouter initialEntries={[`/${locale}/tunisia`]}>
            <Suspense>
              <CountryPage country="tunisia" />
            </Suspense>
          </MemoryRouter>
        </ImageCatalogContext>
      </ContentProvider>,
    );
    await waitFor(() => expect(container.querySelector('.monument-grid')).toBeInTheDocument());
    const section = (id: string) => container.querySelector<HTMLElement>(`#${id}`)!;
    const assertItems = (
      parent: Element,
      expected: { id: string; title?: string; name?: string; date?: string; text?: string }[],
    ) => {
      const rendered = parent.querySelectorAll<HTMLElement>('[data-item-id]');
      expect([...rendered].map((item) => item.dataset.itemId)).toEqual(expected.map((item) => item.id));
      for (const [index, item] of expected.entries()) {
        expect(rendered[index]?.textContent).toContain(item.title ?? item.name ?? item.date ?? '');
        if (item.text) expect(rendered[index]?.textContent).toContain(item.text);
      }
    };
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(container.querySelectorAll('.country-facts > div')).toHaveLength(tunisia.welcome.facts.length);
    expect(container.querySelectorAll('.country-words tbody tr')).toHaveLength(tunisia.welcome.words.length);
    expect(container.querySelectorAll('.country-trivia li')).toHaveLength(tunisia.welcome.didYouKnow.length);
    expect(container.querySelectorAll('.destination-card')).toHaveLength(
      tunisia.destinations.featured.length + tunisia.destinations.more.length,
    );
    expect(container.querySelectorAll('.spotlight-grid article')).toHaveLength(
      tunisia.destinations.spotlight.places.length,
    );
    for (const group of tunisia.wear.groups)
      assertItems(section('wear').querySelector(`[data-wear-group="${group.id}"]`)!, group.items);
    expect(section('wear').querySelectorAll('[data-regional]')).toHaveLength(tunisia.wear.regional.length);
    for (const group of tunisia.nature.groups)
      assertItems(section('nature').querySelector(`.nature-${group.id}`)!, group.items);
    assertItems(section('cities'), tunisia.cities.items);
    const history = section('history');
    expect(history.querySelectorAll('li:not([hidden])')).toHaveLength(10);
    const more = within(history).getByRole('button', { name: common.ui.showMore });
    fireEvent.click(more);
    expect(history.querySelectorAll('li:not([hidden])')).toHaveLength(tunisia.history.timeline.length);
    assertItems(history.querySelector('ol')!, tunisia.history.timeline);
    assertItems(history.querySelector('.figure-grid')!, tunisia.history.figures);
    for (const group of tunisia.festive.groups)
      assertItems(section('festive').querySelector(`[data-festive-group="${group.id}"]`)!, group.items);
    expect(section('festive').querySelector('.wedding-feature')?.textContent).toContain(
      tunisia.festive.weddings.text,
    );
    expect(section('festive').querySelector('[data-item-id="new-year"]')).not.toHaveTextContent('undefined');
    expect(section('festive').querySelector('[data-item-id="new-year"] p:not(.holiday-date)')).toBeNull();
    for (const group of tunisia.food.groups)
      assertItems(section('food').querySelector(`[data-food-group="${group.id}"]`)!, group.items);
    expect(section('food').querySelector('.product-strip')?.textContent).toContain(tunisia.food.products);
    expect(section('food').querySelectorAll('.product-images figure')).toHaveLength(
      sourceMedia.tunisia.food.productImages.length,
    );
    assertItems(section('monuments'), tunisia.monuments.items);
    fireEvent.click(within(section('monuments')).getByRole('checkbox', { name: common.ui.unescoOnly }));
    const listed = new Set(
      Object.entries(sourceMedia.tunisia.monuments.items)
        .filter(([, value]) => 'unesco' in value && value.unesco)
        .map(([id]) => id),
    );
    assertItems(
      section('monuments'),
      tunisia.monuments.items.filter((item) => listed.has(item.id)),
    );
    fireEvent.click(within(section('monuments')).getByRole('checkbox'));
    assertItems(section('monuments'), tunisia.monuments.items);
    expect(container.querySelectorAll('.country-continue a')).toHaveLength(2);
    expect(container.querySelector('.country-continue a')).toHaveAttribute('href', `/${locale}/bahrain`);
  });
});
