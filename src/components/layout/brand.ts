import { env } from '@/lib/env';
const files = import.meta.glob('/public/brand/**/*.svg', { query: '?url', import: 'default', eager: true });
export const brandExists = (file: string) => Object.hasOwn(files, `/public/brand/${file}`);
export const brandUrl = (file: string) => `${env.basePath}brand/${file}`;
export const unitLogos = Object.keys(files)
  .filter((file) => file.startsWith('/public/brand/units/'))
  .map((file) => ({
    src: brandUrl(file.replace('/public/brand/', '')),
    name: file
      .split('/')
      .at(-1)!
      .replace(/\.svg$/, '')
      .replace(/[-_]/g, ' '),
  }));
