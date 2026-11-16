import { brandExists, brandUrl } from './brand';
export function IeeeMasterBrand({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const name = `ieee-master-brand-${tone === 'dark' ? 'white' : 'black'}`;
  const file = `${name}${brandExists(`${name}.svg`) ? '' : '.PLACEHOLDER'}.svg`;
  return (
    <a className="master-brand" href="https://www.ieee.org" lang="en" dir="ltr">
      <img src={brandUrl(file)} width="100" height="33" alt="IEEE" />
    </a>
  );
}
