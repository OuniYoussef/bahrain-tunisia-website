import { defineConfig } from '@playwright/test';
import config from './playwright.config.ts';
export default defineConfig({
  ...config,
  testMatch: 'admin.spec.ts',
  testIgnore: [],
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5176 --strictPort',
      url: 'http://127.0.0.1:5176',
      reuseExistingServer: false,
      env: {
        VITE_VAULT_MODE: 'supabase',
        VITE_SUPABASE_URL: 'https://admin-test.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_admin_test',
      },
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5177 --strictPort',
      url: 'http://127.0.0.1:5177',
      reuseExistingServer: false,
      env: { VITE_VAULT_MODE: 'mock' },
    },
  ],
});
