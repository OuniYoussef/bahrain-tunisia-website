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

for (const country of ['tunisia', 'bahrain'] as const) {
  describe.each(['en', 'fr', 'ar'] as const)(country + ' in %s', (locale: Locale) => {
    it('renders every source item once, including hidden groups and the expanded timeline', async () => {
      const [content, common, images] = await Promise.all([
        loadNamespace(locale, country),
        loadNamespace(locale, 'common'),
        loadNamespace(locale, 'images'),
      ]);
      const { container } = render(
        <ContentProvider locale={locale} content={{ [country]: content, common, images }}>
          <ImageCatalogContext value={{}}>
            <MemoryRouter initialEntries={[`/${locale}/${country}`]}>
              <Suspense>
                <CountryPage country={country} />
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
      expect(container.querySelectorAll('.country-facts > div')).toHaveLength(content.welcome.facts.length);
      expect(container.querySelectorAll('.country-words tbody tr')).toHaveLength(
        content.welcome.words.length,
      );
      expect(container.querySelectorAll('.country-trivia li')).toHaveLength(
        content.welcome.didYouKnow.length,
      );
      expect(container.querySelectorAll('.destination-card')).toHaveLength(
        content.destinations.featured.length + content.destinations.more.length,
      );
      expect(container.querySelectorAll('.spotlight-grid article')).toHaveLength(
        'spotlight' in content.destinations ? content.destinations.spotlight.places.length : 0,
      );
      for (const group of content.wear.groups)
        assertItems(section('wear').querySelector(`[data-wear-group="${group.id}"]`)!, group.items);
      expect(section('wear').querySelectorAll('[data-regional]')).toHaveLength(
        'regional' in content.wear ? content.wear.regional.length : 0,
      );
      for (const group of content.nature.groups)
        assertItems(section('nature').querySelector(`.nature-${group.id}`)!, group.items);
      assertItems(section('cities'), content.cities.items);
      const history = section('history');
      expect(history.querySelectorAll('.timeline-track li:not([hidden])')).toHaveLength(10);
      const more = within(history).getByRole('button', { name: common.ui.showMore });
      fireEvent.click(more);
      expect(history.querySelectorAll('.timeline-track li:not([hidden])')).toHaveLength(
        content.history.timeline.length,
      );
      assertItems(history.querySelector('ol')!, content.history.timeline);
      assertItems(history.querySelector('.figure-grid')!, content.history.figures);
      for (const group of content.festive.groups)
        assertItems(section('festive').querySelector(`[data-festive-group="${group.id}"]`)!, group.items);
      expect(section('festive').querySelector('.wedding-feature')?.textContent).toContain(
        content.festive.weddings.text,
      );
      expect(section('festive').querySelector('[data-item-id="new-year"]')).not.toHaveTextContent(
        'undefined',
      );
      expect(section('festive').querySelector('[data-item-id="new-year"] p:not(.holiday-date)')).toBeNull();
      for (const group of content.food.groups)
        assertItems(section('food').querySelector(`[data-food-group="${group.id}"]`)!, group.items);
      expect(section('food').querySelector('.product-strip')?.textContent).toContain(content.food.products);
      expect(section('food').querySelectorAll('.product-images figure')).toHaveLength(
        sourceMedia[country].food.productImages.length,
      );
      assertItems(section('monuments'), content.monuments.items);
      fireEvent.click(within(section('monuments')).getByRole('checkbox', { name: common.ui.unescoOnly }));
      const listed = new Set(
        Object.entries(sourceMedia[country].monuments.items)
          .filter(([, value]) => 'unesco' in value && value.unesco)
          .map(([id]) => id),
      );
      assertItems(
        section('monuments'),
        content.monuments.items.filter((item) => listed.has(item.id)),
      );
      fireEvent.click(within(section('monuments')).getByRole('checkbox'));
      assertItems(section('monuments'), content.monuments.items);

      if ('nicknames' in content.welcome) {
        assertItems(container.querySelector('.nickname-labels')!, content.welcome.nicknames);
        expect(container.querySelector('.two-waters blockquote')?.textContent).toBe(
          content.welcome.nameOrigin,
        );
      }
      if ('jewelleryNote' in content.wear) {
        expect(container.querySelector('.jewellery-note')?.textContent).toBe(content.wear.jewelleryNote);
        expect(container.querySelectorAll('.bahrain-crafts [data-wear-group]')).toHaveLength(2);
        expect(container.querySelectorAll('.wear-accordions details')).toHaveLength(4);
      }
      if ('pearl' in content.history) {
        expect(container.querySelectorAll('[data-pearl-label]')).toHaveLength(5);
        expect(container.querySelector('.pearl-scale')).toHaveTextContent(
          content.history.pearl.scale.join(''),
        );
      }
      if ('coffee' in content.food) {
        expect(container.querySelector('.coffee-feature')?.textContent).toContain(content.food.coffee.text);
        expect(container.querySelector('.coffee-etiquette')?.textContent).toBe(content.food.coffee.etiquette);
        expect(container.querySelector('.gargeean-quote blockquote')?.textContent).toBe(
          content.festive.groups
            .find((g) => g.id === 'ramadan')!
            .items.find((i) => i.id === 'gargeean-chant')!.text,
        );
        for (const year of ['2005', '2012', '2019']) expect(section('monuments')).toHaveTextContent(year);
      }
      expect(container.querySelectorAll('.country-continue a')).toHaveLength(2);

      expect(container.querySelector('.country-continue a')).toHaveAttribute(
        'href',
        `/${locale}/${country === 'tunisia' ? 'bahrain' : 'tunisia'}`,
      );
    });
  });
}
