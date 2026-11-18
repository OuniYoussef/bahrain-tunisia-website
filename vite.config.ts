import { fileURLToPath, URL } from 'node:url';
import { access } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { parseEnv } from './src/lib/env-schema.ts';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'preview-localized-html',
        configurePreviewServer(server) {
          const directory = resolve(server.config.root, server.config.build.outDir);
          server.middlewares.use(async (request, _response, next) => {
            try {
              const url = new URL(request.url || '/', 'http://localhost');
              const pathname = decodeURIComponent(url.pathname);
              const prefix = server.config.base.replace(/\/$/, '');
              const localPath = pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname;
              const file = resolve(directory, `.${localPath}`, 'index.html');
              if (file.startsWith(directory + sep)) {
                await access(file);
                request.url = `${url.pathname.replace(/\/$/, '')}/index.html${url.search}`;
              }
            } catch {
              /* Assets and unknown routes use Vite's normal handling. */
            }
            next();
          });
        },
      },
    ],
    define: { __PUBLIC_ENV__: JSON.stringify(parseEnv(env)) },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    base: env.VITE_BASE_PATH || '/',
    build: { target: 'es2022', manifest: true },
  };
});
