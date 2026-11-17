import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
const read = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
it('projects every selected slide and its image labels exactly from canonical content', () => {
  for (const locale of ['en', 'fr', 'ar']) {
    const source = read(`../../content/locales/${locale}/matrix.json`);
    const labels = read(`../../content/locales/${locale}/images.json`);
    for (const slide of source.slides) {
      const view = read(`../../content/generated/matrix-views/${locale}/${slide.id}.json`);
      expect(view.matrix.slides.find((item: { id: string }) => item.id === slide.id)).toEqual(slide);
      expect(view.matrix.slides.map((item: { id: string }) => item.id)).toEqual(
        source.slides.map((item: { id: string }) => item.id),
      );
      for (const [id, label] of Object.entries(view.images)) expect(label).toBe(labels[id]);
      expect(view.matrix.ui).toEqual(source.ui);
    }
  }
});
