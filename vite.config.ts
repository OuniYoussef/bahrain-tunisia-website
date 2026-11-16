import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { parseEnv } from './src/lib/env-schema.ts';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react(), tailwindcss()],
    define: { __PUBLIC_ENV__: JSON.stringify(parseEnv(env)) },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    base: env.VITE_BASE_PATH || '/',
    build: { target: 'es2022' },
  };
});
