import { env } from '@/lib/env';
import files from '@/content/generated/brand.json';
export const brandExists = (file: string) => files.includes(file);
export const brandUrl = (file: string) => `${env.basePath}brand/${file}`;
export const unitLogos = files
  .filter((file) => file.startsWith('units/'))
  .map((file) => ({
    src: brandUrl(file),
    name: file
      .split('/')
      .at(-1)!
      .replace(/\.svg$/, '')
      .replace(/[-_]/g, ' '),
  }));
