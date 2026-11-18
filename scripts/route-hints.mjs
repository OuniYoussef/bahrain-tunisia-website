import { readFile } from 'node:fs/promises';

// Discover only this route's startup graph; retain lazy loading for other pages.
export async function routeHints(out, base) {
  const manifest = JSON.parse(await readFile(`${out}/.vite/manifest.json`, 'utf8'));
  const entryCss = new Set(Object.values(manifest).filter(entry => entry.isEntry).flatMap(entry => entry.css || []));
  const media = JSON.parse(await readFile('src/content/media.json', 'utf8'));
  const { images } = JSON.parse(await readFile('src/content/generated/images.generated.json', 'utf8'));
  return (locale, path) => {
    const section = path.split('/')[0];
    const feature = ({ '': 'united/UnitedPage', tunisia: 'country/CountryPage', bahrain: 'country/CountryPage',
      'common-grounds': 'common-grounds/CommonGroundsPage', vault: 'vault/VaultPage',
      contact: 'misc/ContactPage', credits: 'misc/CreditsPage' })[section];
    const roots = ['src/app/RootLayout.tsx', `src/content/locales/${locale}/common.json`];
    if (feature) roots.push(`src/features/${feature}.tsx`);
    if (['tunisia', 'bahrain'].includes(section)) roots.push(`src/content/generated/country/${locale}-${section}.json`);
    else if (!section || section === 'vault') roots.push(`src/content/locales/${locale}/${section || 'united'}.json`);
    else if (section === 'common-grounds') {
      roots.push(`src/content/generated/matrix-views/${locale}/${path.split('/')[1] || 'intro'}.json`);
      if (!path.includes('/')) roots.push('src/features/common-grounds/MatrixIntro.tsx', 'src/content/generated/matrix/intro.json');
    }
    const seen = new Set();
    const links = new Set();
    function visit(key) {
      if (seen.has(key)) return;
      seen.add(key);
      const entry = manifest[key];
      if (!entry) return;
      if (entry.file.endsWith('.js')) links.add(`<link rel="modulepreload" href="${base}${entry.file}">`);
      for (const css of entry.css || []) if (!entryCss.has(css)) links.add(`<link rel="stylesheet" href="${base}${css}">`);
      for (const child of entry.imports || []) visit(child);
    }
    roots.forEach(visit);
    const ids = !section ? media.united.hero.images : ['tunisia', 'bahrain'].includes(section) ? [media[section].welcome.images[0]] : [];
    for (const id of ids) {
      const image = images[id];
      if (!image) continue;
      const sizes = !section ? '(min-width: 1024px) 58vw, 100vw' : '100vw';
      for (const mobile of [true, false]) {
        const srcset = image.widths.filter(w => !mobile || w <= 1280).map(w => `${base}${image.src.replace(/^\//, '')}-${w}.webp ${w}w`).join(', ');
        links.add(`<link rel="preload" as="image" fetchpriority="high" media="${mobile ? '(width &lt; 1024px)' : '(width &gt;= 1024px)'}" imagesrcset="${srcset}" imagesizes="${sizes}">`);
      }
    }
    return [...links].join('\n');
  };
}
