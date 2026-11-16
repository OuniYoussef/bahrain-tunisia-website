import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';
import { fileURLToPath } from 'node:url';

export default defineConfig((env) =>
  mergeConfig(viteConfig(env), {
    resolve: { alias: { '/images': fileURLToPath(new URL('./public/images', import.meta.url)) } },
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      coverage: { provider: 'v8', include: ['src/**/*.{ts,tsx}'] },
    },
  }),
);
